import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const tripsRouter = Router();
tripsRouter.use(requireAuth);

// ---- List current user's trips ----
tripsRouter.get("/", async (req: AuthedRequest, res) => {
  const trips = await prisma.trip.findMany({
    where: { userId: req.userId },
    orderBy: { startDate: "asc" },
    include: { stops: { select: { id: true, city: true, country: true } } },
  });
  res.json(trips);
});

// ---- Create trip ----
const createTripSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((d) => d.endDate >= d.startDate, {
  message: "endDate must be on or after startDate",
  path: ["endDate"],
});

tripsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createTripSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const trip = await prisma.trip.create({
    data: { ...parsed.data, userId: req.userId! },
  });
  res.status(201).json(trip);
});

// ---- Helper: ownership or shared-access check ----
async function getAccessibleTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: { orderBy: { orderIndex: "asc" }, include: { activities: true } },
      budgets: true,
      shares: true,
    },
  });
  if (!trip) return { trip: null, allowed: false, canEdit: false };
  if (trip.userId === userId) return { trip, allowed: true, canEdit: true };
  const share = trip.shares.find((s) => s.sharedWithUserId === userId);
  if (share) return { trip, allowed: true, canEdit: share.permission === "edit" };
  if (trip.isPublic) return { trip, allowed: true, canEdit: false };
  return { trip, allowed: false, canEdit: false };
}


// ---- Get single trip (full detail) ----
tripsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const { trip, allowed, canEdit } = await getAccessibleTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (!allowed) return res.status(403).json({ error: "Not authorized to view this trip" });
  res.json({ ...trip, viewerCanEdit: canEdit, viewerIsOwner: trip.userId === req.userId });
});

// ---- Update trip ----
const updateTripSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

tripsRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const { trip, canEdit } = await getAccessibleTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (!canEdit) return res.status(403).json({ error: "Not authorized to edit this trip" });

  const parsed = updateTripSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.trip.update({
    where: { id: trip.id },
    data: parsed.data,
  });
  res.json(updated);
});

// ---- Delete trip ----
tripsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (trip.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });

  await prisma.trip.delete({ where: { id: trip.id } });
  res.status(204).send();
});

// ---- Add a stop ----
const createStopSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  arrivalDate: z.coerce.date(),
  departureDate: z.coerce.date(),
  orderIndex: z.number().int().nonnegative(),
  plannedBudget: z.number().nonnegative().optional(),
  notes: z.string().optional(),
}).refine((d) => d.departureDate >= d.arrivalDate, {
  message: "departureDate must be on or after arrivalDate",
  path: ["departureDate"],
});

tripsRouter.post("/:id/stops", async (req: AuthedRequest, res) => {
  const { trip, canEdit } = await getAccessibleTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (!canEdit) return res.status(403).json({ error: "Not authorized to edit this trip" });

  const parsed = createStopSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const stop = await prisma.tripStop.create({
    data: { ...parsed.data, tripId: trip.id },
  });
  res.status(201).json(stop);
});

// ---- Budget breakdown (aggregated) ----
tripsRouter.get("/:id/budget", async (req: AuthedRequest, res) => {
  const { trip, allowed } = await getAccessibleTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (!allowed) return res.status(403).json({ error: "Not authorized" });

  const activityIds = trip.stops.flatMap((s) => s.activities.map((a) => a.id));

  const actualByCategory = await prisma.activity.groupBy({
    by: ["category"],
    where: { id: { in: activityIds } },
    _sum: { estimatedCost: true },
  });

  const planned = trip.budgets;
  const totalPlanned = planned.reduce((sum, b) => sum + Number(b.plannedAmount), 0);
  const totalActual = actualByCategory.reduce((sum, c) => sum + Number(c._sum.estimatedCost ?? 0), 0);

  res.json({
    planned,
    actualByCategory: actualByCategory.map((c) => ({
      category: c.category,
      total: Number(c._sum.estimatedCost ?? 0),
    })),
    totalPlanned,
    totalActual,
  });
});

// ---- Calendar view (activities grouped by date) ----
tripsRouter.get("/:id/calendar", async (req: AuthedRequest, res) => {
  const { trip, allowed } = await getAccessibleTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (!allowed) return res.status(403).json({ error: "Not authorized" });

  const byDate: Record<string, unknown[]> = {};
  for (const stop of trip.stops) {
    for (const activity of stop.activities) {
      const key = activity.date.toISOString().slice(0, 10);
      byDate[key] ??= [];
      byDate[key].push({ ...activity, city: stop.city });
    }
  }
  res.json(byDate);
});

// ---- Share trip (public toggle or invite by email) ----
const shareSchema = z.object({
  makePublic: z.boolean().optional(),
  inviteEmail: z.string().email().optional(),
  permission: z.enum(["view", "edit"]).default("view"),
});

tripsRouter.post("/:id/share", async (req: AuthedRequest, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (trip.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });

  const parsed = shareSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { makePublic, inviteEmail, permission } = parsed.data;

  if (typeof makePublic === "boolean") {
    await prisma.trip.update({ where: { id: trip.id }, data: { isPublic: makePublic } });
  }

  if (inviteEmail) {
    const invitee = await prisma.user.findUnique({ where: { email: inviteEmail } });
    if (!invitee) return res.status(404).json({ error: "No user with that email" });
    if (invitee.id === trip.userId) {
      return res.status(400).json({ error: "That's already the trip owner" });
    }
    await prisma.tripShare.upsert({
      where: { tripId_sharedWithUserId: { tripId: trip.id, sharedWithUserId: invitee.id } },
      create: { tripId: trip.id, sharedWithUserId: invitee.id, permission },
      update: { permission },
    });
  }

  const updated = await prisma.trip.findUnique({
    where: { id: trip.id },
    include: { shares: { include: { sharedWithUser: { select: { id: true, name: true, email: true } } } } },
  });
  res.json(updated);
});

// ---- Revoke a collaborator's access ----
tripsRouter.delete("/:id/share/:shareId", async (req: AuthedRequest, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  if (trip.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });

  await prisma.tripShare.delete({ where: { id: req.params.shareId } });
  res.status(204).send();
});

// ---- Public read-only view by share token (no auth) ----
export const publicTripsRouter = Router();

publicTripsRouter.get("/:shareToken", async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { shareToken: req.params.shareToken },
    include: { stops: { orderBy: { orderIndex: "asc" }, include: { activities: true } } },
  });
  if (!trip || !trip.isPublic) return res.status(404).json({ error: "Trip not found or not public" });
  res.json(trip);
});

// POST /api/public/trips/:shareToken/copy (requires auth)
publicTripsRouter.post("/:shareToken/copy", requireAuth, async (req: AuthedRequest, res) => {
  const source = await prisma.trip.findUnique({
    where: { shareToken: req.params.shareToken },
    include: {
      stops: { include: { activities: true }, orderBy: { orderIndex: "asc" } },
      budgets: true,
    },
  });
  if (!source || !source.isPublic) return res.status(404).json({ error: "Trip not found or not public" });

  const cloned = await prisma.trip.create({
    data: {
      userId: req.userId!,
      title: `${source.title} (Copy)`,
      description: source.description,
      coverImage: source.coverImage,
      startDate: source.startDate,
      endDate: source.endDate,
      isPublic: false,
      stops: {
        create: source.stops.map((s) => ({
          city: s.city,
          country: s.country,
          arrivalDate: s.arrivalDate,
          departureDate: s.departureDate,
          orderIndex: s.orderIndex,
          plannedBudget: s.plannedBudget,
          notes: s.notes,
          activities: {
            create: s.activities.map((a) => ({
              name: a.name,
              category: a.category,
              date: a.date,
              startTime: a.startTime,
              endTime: a.endTime,
              estimatedCost: a.estimatedCost,
              currency: a.currency,
              notes: a.notes,
            })),
          },
        })),
      },
      budgets: {
        create: source.budgets.map((b) => ({
          category: b.category,
          plannedAmount: b.plannedAmount,
        })),
      },
    },
  });

  res.status(201).json(cloned);
});

