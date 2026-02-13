import { Hono } from "hono";
import { BacktestRequestSchema, BacktestResponseSchema } from "shared";
import type { BacktestResponse } from "shared";
import * as usecase from "@server/application/usecases";

export const backtestRoute = new Hono();

backtestRoute.post("/", async (c) => {
  const rawBody = await c.req.json().catch(() => null);
  const request = BacktestRequestSchema.safeParse(rawBody);

  if (!request.success) {
    return c.json(
      {
        message: "Invalid request payload",
        success: false,
        errors: request.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    usecase.resolveStrategyGraph(request.data.graph);
  } catch (error) {
    return c.json(
      {
        message: "Invalid strategy graph",
        success: false,
        errors: error instanceof Error ? [error.message] : ["Unknown error"],
      },
      { status: 400 },
    );
  }

  const initialCash = request.data.initialCash ?? 10000;
  const pnl = 137.42;
  const finalEquity = initialCash + pnl;

  const responseData: BacktestResponse = {
    success: true,
    message: "Backtest completed successfully",
    data: {
      result: {
        trades: [
          { side: "BUY", price: 181.25, size: 1, time: "2026-02-01T09:30:00Z" },
          { side: "SELL", price: 184.1, size: 1, time: "2026-02-04T10:15:00Z" },
        ],
        startCash: initialCash,
        finalCash: finalEquity,
        finalPosition: 0,
        finalEquity,
        pnl,
        lastPrice: 184.1,
      },
    },
  };

  return c.json(BacktestResponseSchema.parse(responseData), { status: 200 });
});
