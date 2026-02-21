import { Hono } from "hono";
import { cors } from "hono/cors";

import { adminRoute } from "./routes/admin";
import { backtestRoute } from "./routes/backtest";

const app = new Hono();

app.use(cors());

app.route("/backtest", backtestRoute);
app.route("/admin", adminRoute);

export default app;
