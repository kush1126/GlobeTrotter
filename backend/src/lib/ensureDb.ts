import EmbeddedPostgres from "embedded-postgres";
import fs from "fs";
import path from "path";
import net from "net";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, "../../data/postgres");

function isPortOpen(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function ensureDatabase() {
  const isRunning = await isPortOpen(5432);
  if (isRunning) {
    return;
  }

  console.log("Postgres not detected on port 5432. Starting embedded postgres at", dbDir);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port: 5432,
    user: "postgres",
    password: "password",
    persistent: true,
  });

  try {
    if (!fs.existsSync(path.join(dbDir, "PG_VERSION"))) {
      console.log("Initialising embedded postgres cluster...");
      await pg.initialise();
    }
  } catch (e) {
    // Already initialized
  }

  await pg.start();
  console.log("Embedded postgres started.");

  // Wait until port 5432 responds
  for (let i = 0; i < 20; i++) {
    if (await isPortOpen(5432)) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  try {
    await pg.createDatabase("globaltrotters");
  } catch (e: any) {
    // database might already exist
  }
}
