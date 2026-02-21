import { Hono } from "hono";
import { cors } from "hono/cors";

import { adminRoute } from "./routes/admin";
import { backtestRoute } from "./routes/backtest";

const app = new Hono()
  .use(cors())
  .route("/backtest", backtestRoute)
  .route("/admin", adminRoute);

export default app;
