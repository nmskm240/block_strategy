import * as usecase from "@server/application/usecases";
import { backtestServiceDep } from "@server/infra/dependencies";
import { Hono } from "hono";
import type { BacktestResponse } from "shared";
import { BacktestRequestSchema, BacktestResponseSchema } from "shared";

type BacktestRouteVariables = {
  backtestService: Awaited<ReturnType<typeof backtestServiceDep.resolve>>;
};

export const backtestRoute = new Hono<{ Variables: BacktestRouteVariables }>()
  .use("*", backtestServiceDep.middleware("backtestService"))
  .post("/", async (c) => {
    const rawBody = await c.req.json().catch(() => null);
    const request = BacktestRequestSchema.parse(rawBody);
    const result = await usecase.runBacktest(
      request.graph,
      request.environment,
      c.var.backtestService,
    );

    const responseData: BacktestResponse = {
      success: true,
      message: "Backtest completed successfully",
      data: { result },
    };

    return c.json(BacktestResponseSchema.parse(responseData), { status: 200 });
  });
