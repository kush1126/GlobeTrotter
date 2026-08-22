import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const searchRouter = Router();

// GET /api/search/meta - return list of countries, cities, and categories for dropdowns
searchRouter.get("/meta", async (_req, res) => {
  const all = await prisma.activityCatalog.findMany({
    select: { city: true, country: true },
    distinct: ["city", "country"],
    orderBy: { country: "asc" },
  });

  const countries = Array.from(new Set(all.map((a) => a.country))).sort();
  const cities = all
    .map((a) => ({ city: a.city, country: a.country }))
    .sort((a, b) => a.city.localeCompare(b.city));

  res.json({
    countries,
    cities,
    categories: ["sightseeing", "food", "transport", "stay", "other"],
  });
});

// GET /api/search/activities?city=Paris&country=France&category=food&maxCost=50&q=louvre
searchRouter.get("/activities", async (req, res) => {
  const { city, country, category, maxCost, q } = req.query;

  const whereClause: any = {};

  if (country && String(country).trim()) {
    whereClause.country = { equals: String(country).trim(), mode: "insensitive" };
  }

  if (city && String(city).trim()) {
    whereClause.city = { equals: String(city).trim(), mode: "insensitive" };
  }

  if (category && String(category).trim()) {
    whereClause.category = { equals: String(category).trim(), mode: "insensitive" };
  }

  if (maxCost && !isNaN(Number(maxCost))) {
    whereClause.avgCost = { lte: Number(maxCost) };
  }

  if (q && String(q).trim()) {
    const term = String(q).trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { country: { contains: term, mode: "insensitive" } },
    ];
  }

  const results = await prisma.activityCatalog.findMany({
    where: whereClause,
    orderBy: [{ rating: "desc" }, { name: "asc" }],
    take: 100,
  });

  res.json(results);
});

// GET /api/search/destinations?q=par
searchRouter.get("/destinations", async (req, res) => {
  const { q } = req.query;

  const whereClause: any = {};
  if (q && String(q).trim()) {
    const term = String(q).trim();
    whereClause.OR = [
      { city: { contains: term, mode: "insensitive" } },
      { country: { contains: term, mode: "insensitive" } },
    ];
  }

  const cities = await prisma.activityCatalog.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    distinct: ["city"],
    select: { city: true, country: true, imageUrl: true },
    orderBy: { city: "asc" },
    take: 50,
  });

  res.json(cities);
});
