import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const stopsRouter = Router();
stopsRouter.use(requireAuth);

async function stopOwnedByUser(stopId: string, userId: string) {
  const stop = await prisma.tripStop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });
  if (!stop || stop.trip.userId !== userId) return null;
  return stop;
}

const updateStopSchema = z.object({
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  arrivalDate: z.coerce.date().optional(),
  departureDate: z.coerce.date().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
});

stopsRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const stop = await stopOwnedByUser(req.params.id, req.userId!);
  if (!stop) return res.status(404).json({ error: "Stop not found or not authorized" });

  const parsed = updateStopSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.tripStop.update({ where: { id: stop.id }, data: parsed.data });
  res.json(updated);
});

stopsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const stop = await stopOwnedByUser(req.params.id, req.userId!);
  if (!stop) return res.status(404).json({ error: "Stop not found or not authorized" });
  await prisma.tripStop.delete({ where: { id: stop.id } });
  res.status(204).send();
});

const createActivitySchema = z.object({
  name: z.string().min(1),
  category: z.enum(["sightseeing", "food", "transport", "stay", "other"]),
  date: z.coerce.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  estimatedCost: z.number().nonnegative(),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
});

stopsRouter.post("/:id/activities", async (req: AuthedRequest, res) => {
  const stop = await stopOwnedByUser(req.params.id, req.userId!);
  if (!stop) return res.status(404).json({ error: "Stop not found or not authorized" });

  const parsed = createActivitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const activity = await prisma.activity.create({
    data: { ...parsed.data, stopId: stop.id },
  });
  res.status(201).json(activity);
});

export const activitiesRouter = Router();
activitiesRouter.use(requireAuth);

async function activityOwnedByUser(activityId: string, userId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { stop: { include: { trip: true } } },
  });
  if (!activity || activity.stop.trip.userId !== userId) return null;
  return activity;
}

const updateActivitySchema = createActivitySchema.partial();

activitiesRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const activity = await activityOwnedByUser(req.params.id, req.userId!);
  if (!activity) return res.status(404).json({ error: "Activity not found or not authorized" });

  const parsed = updateActivitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.activity.update({ where: { id: activity.id }, data: parsed.data });
  res.json(updated);
});

activitiesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const activity = await activityOwnedByUser(req.params.id, req.userId!);
  if (!activity) return res.status(404).json({ error: "Activity not found or not authorized" });
  await prisma.activity.delete({ where: { id: activity.id } });
  res.status(204).send();
});
