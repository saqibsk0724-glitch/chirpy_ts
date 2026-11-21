
process.loadEnvFile();

import express from "express";
import "./db/migrate.js";

import { handlerReadiness } from "./api/readiness.js";
import {
  handlerGetChirp,
  handlerGetAllChirps,
  handlerCreateChirp,
} from "./api/chirps.js";
import { handlerCreateUser , handlerLogin , handlerRefresh , handlerRevoke , handlerUpdateUser  } from "./api/users.js";
import { handlerDeleteChirp } from "./api/chirps.js";
import { middlewareLogResponses } from "./api/middleware.js";
import { middlewareMetricsInc } from "./api/middlewareMetrics.js";
import { handlerMetrics, handlerReset } from "./api/metrics.js";
import { errorHandler } from "./api/error.js";
import { config } from "./config.js";
import { handlerPolkaWebhook } from "./api/polka.js";

const app = express();

// Middleware
app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);

// Health check
app.get("/api/healthz", handlerReadiness);

// Admin routes
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

// User routes
app.post("/api/users", handlerCreateUser);
app.put("/api/users", handlerUpdateUser);
app.post("/api/login", handlerLogin);
app.post("/api/polka/webhooks", handlerPolkaWebhook);
// Chirp routes
app.get("/api/chirps", handlerGetAllChirps);
app.get("/api/chirps/:chirpId", handlerGetChirp);
app.post("/api/chirps", handlerCreateChirp);

app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);

app.delete("/api/chirps/:chirpId", handlerDeleteChirp);

// Static files
app.use("/app", express.static("./src/app"));

// Error handler (keep this after all routes)
app.use(errorHandler);



// Start server
app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
