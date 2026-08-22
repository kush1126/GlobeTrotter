import { prisma } from "./lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({ include: { trips: true } });
  console.log("USERS IN DB:", JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
