import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

// ---- Community: browse public trips from all users ----
export const communityRouter = Router();

communityRouter.get("/trips", async (req, res) => {
  const { q } = req.query;

  const trips = await prisma.trip.findMany({
    where: {
      isPublic: true,
      ...(q
        ? {
            OR: [
              { title: { contains: String(q), mode: "insensitive" } },
              { stops: { some: { city: { contains: String(q), mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true } },
      stops: { select: { city: true, country: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(trips);
});

// ---- Calendar: this user's trips across all months, as date-range bars ----
export const calendarRouter = Router();
calendarRouter.use(requireAuth);

calendarRouter.get("/mine", async (req: AuthedRequest, res) => {
  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { userId: req.userId },
        { shares: { some: { sharedWithUserId: req.userId } } },
      ],
    },
    select: { id: true, title: true, startDate: true, endDate: true },
    orderBy: { startDate: "asc" },
  });
  res.json(trips);
});
