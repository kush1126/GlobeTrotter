import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { tripsRouter, publicTripsRouter } from "./routes/trips.js";
import { stopsRouter, activitiesRouter } from "./routes/stopsActivities.js";
import { searchRouter } from "./routes/search.js";
import { communityRouter, calendarRouter } from "./routes/community.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/stops", stopsRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/search", searchRouter);
app.use("/api/community", communityRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/public/trips", publicTripsRouter);

import { ensureDatabase } from "./lib/ensureDb.js";

// Central error handler (catches thrown/rejected errors from routes)
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  await ensureDatabase();
  app.listen(PORT, () => {
    console.log(`GlobalTrotters API listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

