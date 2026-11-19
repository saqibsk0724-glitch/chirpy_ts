
import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses } from "./api/middleware.js";
import { middlewareMetricsInc } from "./api/middlewareMetrics.js";
import { handlerMetrics , handlerReset } from "./api/metrics.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses)

app.use("/app" , middlewareMetricsInc)

app.get("/api/healthz", handlerReadiness);
app.get("/api/metrics" , handlerMetrics)
app.get("/api/reset" , handlerReset)

app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
