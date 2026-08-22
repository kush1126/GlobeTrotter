import { prisma } from "./lib/prisma.js";

async function inspect() {
  console.log("==================================================");
  console.log("       GLOBALTROTTERS DATABASE INSPECTION         ");
  console.log("==================================================\n");

  // 1. Table Counts
  const userCount = await prisma.user.count();
  const tripCount = await prisma.trip.count();
  const stopCount = await prisma.tripStop.count();
  const activityCount = await prisma.activity.count();
  const budgetCount = await prisma.budgetItem.count();
  const shareCount = await prisma.tripShare.count();
  const catalogCount = await prisma.activityCatalog.count();

  console.log("📊 TABLE ROW COUNTS:");
  console.log(`- Users:            ${userCount}`);
  console.log(`- Trips:            ${tripCount}`);
  console.log(`- Trip Stops:       ${stopCount}`);
  console.log(`- Activities:       ${activityCount}`);
  console.log(`- Budget Items:     ${budgetCount}`);
  console.log(`- Trip Shares:      ${shareCount}`);
  console.log(`- Activity Catalog: ${catalogCount}\n`);

  // 2. Users and their Trips
  console.log("👤 USERS & TRIPS:");
  const users = await prisma.user.findMany({
    include: {
      trips: {
        include: {
          stops: {
            include: {
              activities: true,
            },
            orderBy: { orderIndex: "asc" },
          },
          budgets: true,
          shares: true,
        },
      },
      sharedWithMe: true,
    },
  });

  if (users.length === 0) {
    console.log("  No users registered yet.");
  } else {
    for (const u of users) {
      console.log(`\n• User ID: ${u.id}`);
      console.log(`  Name: ${u.name} | Email: ${u.email} | Currency: ${u.currency} | Language: ${u.language}`);
      console.log(`  Created At: ${u.createdAt.toISOString()}`);
      console.log(`  Trips (${u.trips.length}):`);
      for (const t of u.trips) {
        console.log(`    - Trip: "${t.title}" (ID: ${t.id})`);
        console.log(`      Dates: ${t.startDate.toISOString().split("T")[0]} to ${t.endDate.toISOString().split("T")[0]}`);
        console.log(`      Public: ${t.isPublic} | Share Token: ${t.shareToken}`);
        console.log(`      Stops (${t.stops.length}):`);
        for (const s of t.stops) {
          console.log(`        * Stop #${s.orderIndex + 1}: ${s.city}, ${s.country} (${s.arrivalDate.toISOString().split("T")[0]} -> ${s.departureDate.toISOString().split("T")[0]}) [Planned Budget: $${s.plannedBudget ?? 0}]`);
          console.log(`          Activities (${s.activities.length}):`);
          for (const a of s.activities) {
            console.log(`            · ${a.name} [${a.category}] - $${a.estimatedCost} ${a.currency} (${a.startTime ?? "N/A"}-${a.endTime ?? "N/A"})`);
          }
        }
        if (t.budgets.length > 0) {
          console.log(`      Budget breakdown: ${t.budgets.map(b => `${b.category}: $${b.plannedAmount}`).join(", ")}`);
        }
        if (t.shares.length > 0) {
          console.log(`      Shared with: ${t.shares.map(sh => `${sh.sharedWithUserId ?? "public"} (${sh.permission})`).join(", ")}`);
        }
      }
    }
  }

  // 3. Activity Catalog Summary
  console.log("\n🏛️ ACTIVITY CATALOG BREAKDOWN:");
  const cities = await prisma.activityCatalog.groupBy({
    by: ["city", "country"],
    _count: { id: true },
    _avg: { avgCost: true },
  });

  for (const c of cities) {
    console.log(`  • ${c.city}, ${c.country}: ${c._count.id} activities (Avg cost: $${Number(c._avg.avgCost).toFixed(2)})`);
  }

  const sampleCatalog = await prisma.activityCatalog.findMany({
    take: 5,
    select: { id: true, name: true, city: true, category: true, avgCost: true, rating: true },
  });
  console.log("\n  Sample catalog entries:");
  for (const item of sampleCatalog) {
    console.log(`  - [${item.category.toUpperCase()}] ${item.name} (${item.city}) - $${item.avgCost} (Rating: ${item.rating ?? "N/A"})`);
  }

  console.log("\n==================================================");
  console.log("       INSPECTION COMPLETED SUCCESSFULLY          ");
  console.log("==================================================");
}

inspect()
  .catch((e) => console.error("Database query failed:", e))
  .finally(() => prisma.$disconnect());
