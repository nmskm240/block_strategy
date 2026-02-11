import { Hono } from "hono";
import { BacktestRequestSchema, BacktestResponseSchema } from "shared";
import type { BacktestResponse } from "shared";

export const backtestRoute = new Hono();

backtestRoute.post("/", async (c) => {
  const rawBody = await c.req.json().catch(() => null);
  const parseResult = BacktestRequestSchema.safeParse(rawBody);

  if (!parseResult.success) {
    return c.json(
      {
        message: "Invalid request payload",
        success: false,
        errors: parseResult.error.issues,
      },
      { status: 400 },
    );
  }

  const initialCash = parseResult.data.initialCash ?? 10000;
  const pnl = 137.42;
  const finalEquity = initialCash + pnl;

  const responseData: BacktestResponse = {
    success: true,
    message: "Backtest completed successfully",
    data: {
      requestId: crypto.randomUUID(),
      mql: `// mock MQL generated for ${parseResult.data.symbol}`,
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
