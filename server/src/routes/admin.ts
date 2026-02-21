import { ohlcvRepositoryDep } from "@server/infra/dependencies";
import { Hono } from "hono";
import type { OHLCV, SeedOhlcvResponse } from "shared";
import { SeedOhlcvRequestSchema, SeedOhlcvResponseSchema } from "shared";

type AdminRouteVariables = {
  ohlcvRepository: Awaited<ReturnType<typeof ohlcvRepositoryDep.resolve>>;
};

function makeSeedOhlcvs(days: number, untilMs = Date.now()): OHLCV[] {
  const intervalMs = 60 * 60 * 1000;
  const count = days * 24;
  const startMs = untilMs - (count - 1) * intervalMs;
  const rows: OHLCV[] = [];
  let price = 100;
  for (let i = 0; i < count; i += 1) {
    const timestamp = startMs + i * intervalMs;
    const wave = Math.sin(i / 8) * 1.2;
    const drift = 0.08;
    const open = price;
    const close = Math.max(1, open + drift + wave);
    const high = Math.max(open, close) + 0.6;
    const low = Math.min(open, close) - 0.6;
    const volume = 500 + i * 7;
    rows.push({ timestamp, open, high, low, close, volume });
    price = close;
  }
  return rows;
}

export const adminRoute = new Hono<{ Variables: AdminRouteVariables }>()
  .use("*", ohlcvRepositoryDep.middleware("ohlcvRepository"))
  .post("/seed-ohlcv", async (c) => {
    const rawBody = await c.req.json().catch(() => null);
    const request = SeedOhlcvRequestSchema.parse(rawBody);
    const ohlcvs = makeSeedOhlcvs(request.days);

    await c.var.ohlcvRepository.putOhlcvs(request.symbol, ohlcvs);

    const response: SeedOhlcvResponse = {
      success: true,
      message: "Test OHLCV data inserted",
      data: {
        symbol: request.symbol,
        insertedCount: ohlcvs.length,
        since: new Date(ohlcvs[0]?.timestamp ?? Date.now()).toISOString(),
        until: new Date(ohlcvs[ohlcvs.length - 1]?.timestamp ?? Date.now()).toISOString(),
      },
    };

    return c.json(SeedOhlcvResponseSchema.parse(response), { status: 200 });
  });
