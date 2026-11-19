
import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses } from "./api/middleware.js";
import { middlewareMetricsInc } from "./api/middlewareMetrics.js";
import { handlerMetrics , handlerReset } from "./api/metrics.js";
import { handlerValidateChirp } from "./api/validate_chirp.js";
import { errorHandler  } from "./api/error.js";

const app = express();
const PORT = 8080;

app.use(express.json())

app.use(middlewareLogResponses)

app.use("/app" , middlewareMetricsInc)

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics" , handlerMetrics)
app.post("/admin/reset" , handlerReset)
app.post("/api/validate_chirp", handlerValidateChirp);
app.use("/app", express.static("./src/app"));


app.use(errorHandler);



app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
