import { ohlcvRepositoryDep } from "@server/infra/dependencies";
import { csvToOhlcvs } from "@server/infra/converters";
import type { WorkerBindings } from "@server/infra/bindings";
import { Hono } from "hono";
import type {
  OHLCV,
  OhlcvFileContentResponse,
  OhlcvFileListResponse,
  SeedOhlcvResponse,
} from "shared";
import {
  OhlcvFileContentResponseSchema,
  OhlcvFileListResponseSchema,
  SeedOhlcvRequestSchema,
  SeedOhlcvResponseSchema,
} from "shared";

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
  .get("/ohlcv-files", async (c) => {
    const env = c.env as WorkerBindings;
    const prefix = env.OHLCV_OBJECT_PREFIX ?? "ohlcv/";
    const bucket = env.OHLCV_BUCKET;
    if (!bucket?.list) {
      const response: OhlcvFileListResponse = {
        success: true,
        message: "R2 list API is unavailable in current environment",
        data: { files: [] },
      };
      return c.json(OhlcvFileListResponseSchema.parse(response), { status: 200 });
    }

    const files: string[] = [];
    let cursor: string | undefined;
    for (let i = 0; i < 20; i += 1) {
      const page = await bucket.list({ prefix, cursor, limit: 1000 });
      files.push(
        ...page.objects
          .map((object) => object.key)
          .filter((key) => key.endsWith(".csv")),
      );
      if (!page.truncated || !page.cursor) {
        break;
      }
      cursor = page.cursor;
    }

    const response: OhlcvFileListResponse = {
      success: true,
      message: "OHLCV files fetched",
      data: { files: files.sort() },
    };
    return c.json(OhlcvFileListResponseSchema.parse(response), { status: 200 });
  })
  .get("/ohlcv-file", async (c) => {
    const key = c.req.query("key");
    if (!key) {
      return c.json({ message: "Missing query parameter: key" }, { status: 400 });
    }
    const env = c.env as WorkerBindings;
    const bucket = env.OHLCV_BUCKET;
    if (!bucket) {
      return c.json({ message: "OHLCV_BUCKET is not configured" }, { status: 500 });
    }
    const object = await bucket.get(key);
    if (!object) {
      return c.json({ message: `File not found: ${key}` }, { status: 404 });
    }

    const csv = await object.text();
    const ohlcvs = csvToOhlcvs(csv).sort((a, b) => a.timestamp - b.timestamp);
    const response: OhlcvFileContentResponse = {
      success: true,
      message: "OHLCV file loaded",
      data: {
        key,
        count: ohlcvs.length,
        ohlcvs,
      },
    };
    return c.json(OhlcvFileContentResponseSchema.parse(response), { status: 200 });
  })
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
