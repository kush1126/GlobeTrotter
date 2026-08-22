import EmbeddedPostgres from "embedded-postgres";
import fs from "fs";
import path from "path";

const dbDir = path.resolve("./data/postgres");
const pg = new EmbeddedPostgres({
  databaseDir: dbDir,
  port: 5432,
  user: "postgres",
  password: "password",
  persistent: true,
});

async function main() {
  if (!fs.existsSync(dbDir)) {
    console.log("Initialising embedded postgres cluster...");
    await pg.initialise();
  }

  console.log("Starting embedded postgres...");
  await pg.start();
  console.log("Embedded postgres started on port 5432.");

  try {
    await pg.createDatabase("globaltrotters");
    console.log("Database 'globaltrotters' created/ready.");
  } catch (e: any) {
    if (e?.message?.includes("already exists")) {
      console.log("Database 'globaltrotters' already exists.");
    } else {
      console.log("Database note:", e?.message || e);
    }
  }

  console.log("Postgres is ready for connections!");
}

main().catch((err) => {
  console.error("Failed to start embedded postgres:", err);
  process.exit(1);
});
