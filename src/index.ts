
process.loadEnvFile();

import express from "express";
import "./db/migrate.js";

import { handlerReadiness } from "./api/readiness.js";
import {
  handlerGetChirp,
  handlerGetAllChirps,
  handlerCreateChirp,
} from "./api/chirps.js";
import { handlerCreateUser , handlerLogin } from "./api/users.js";
import { middlewareLogResponses } from "./api/middleware.js";
import { middlewareMetricsInc } from "./api/middlewareMetrics.js";
import { handlerMetrics, handlerReset } from "./api/metrics.js";
import { errorHandler } from "./api/error.js";
import { config } from "./config.js";

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
app.post("/api/login", handlerLogin);
// Chirp routes
app.get("/api/chirps", handlerGetAllChirps);
app.get("/api/chirps/:chirpId", handlerGetChirp);
app.post("/api/chirps", handlerCreateChirp);


// Static files
app.use("/app", express.static("./src/app"));

// Error handler (keep this after all routes)
app.use(errorHandler);

// Start server
app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
