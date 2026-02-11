import { Hono } from "hono";
import { cors } from "hono/cors";

import { backtestRoute } from "./routes/backtest";

const app = new Hono();

app.use(cors());

app.route("/backtest", backtestRoute);

export default app;
