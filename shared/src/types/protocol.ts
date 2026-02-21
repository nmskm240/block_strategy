import * as z from "zod";
import { Graph } from "./graph";
import { OHLCVSchema, Timeframe, TradeSchema } from "./trade";

export const DateRangeSchema = z
  .object({
    since: z.coerce.date(),
    until: z.coerce.date(),
  })
  .refine(({ since, until }) => since < until, {
    message: "since must be earlier than until",
    path: ["until"],
  });

export type DateRange = z.infer<typeof DateRangeSchema>;

export const BacktestEnvironmentSchema = z.object({
  symbol: z.string().trim().min(1, "symbol is required"),
  timeframe: Timeframe.default("1h"),
  testRange: DateRangeSchema,
  cash: z.number().positive().default(10000),
});

export type BacktestEnvironment = z.infer<typeof BacktestEnvironmentSchema>;

export const BacktestRequestSchema = z.object({
  graph: Graph,
  environment: BacktestEnvironmentSchema,
});

export type BacktestRequest = z.infer<typeof BacktestRequestSchema>;

export const BacktestResultSchema = z.object({
  trades: z.array(TradeSchema),
  startCash: z.number(),
  finalCash: z.number(),
  finalPosition: z.number(),
  finalEquity: z.number(),
  pnl: z.number(),
  lastPrice: z.number(),
});

export type BacktestResult = z.infer<typeof BacktestResultSchema>;

export const BacktestResponseSchema = z.object({
  message: z.string(),
  success: z.literal(true),
  data: z.object({
    result: BacktestResultSchema,
  }),
});

export type BacktestResponse = z.infer<typeof BacktestResponseSchema>;

export const SeedOhlcvRequestSchema = z.object({
  symbol: z.string().trim().min(1).default("NASDAQ:AAPL"),
  days: z.number().int().min(1).max(365).default(7),
});

export type SeedOhlcvRequest = z.infer<typeof SeedOhlcvRequestSchema>;

export const SeedOhlcvResponseSchema = z.object({
  message: z.string(),
  success: z.literal(true),
  data: z.object({
    symbol: z.string(),
    insertedCount: z.number().int().nonnegative(),
    since: z.string(),
    until: z.string(),
  }),
});

export type SeedOhlcvResponse = z.infer<typeof SeedOhlcvResponseSchema>;

export const OhlcvFileListResponseSchema = z.object({
  message: z.string(),
  success: z.literal(true),
  data: z.object({
    files: z.array(z.string()),
  }),
});

export type OhlcvFileListResponse = z.infer<typeof OhlcvFileListResponseSchema>;

export const OhlcvFileContentResponseSchema = z.object({
  message: z.string(),
  success: z.literal(true),
  data: z.object({
    key: z.string(),
    count: z.number().int().nonnegative(),
    ohlcvs: z.array(OHLCVSchema),
  }),
});

export type OhlcvFileContentResponse = z.infer<
  typeof OhlcvFileContentResponseSchema
>;

export const ImportTwelveDataRequestSchema = z.object({
  symbol: z.string().trim().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"),
});

export type ImportTwelveDataRequest = z.infer<
  typeof ImportTwelveDataRequestSchema
>;

export const ImportTwelveDataResponseSchema = z.object({
  message: z.string(),
  success: z.literal(true),
  data: z.object({
    symbol: z.string(),
    date: z.string(),
    importedCount: z.number().int().nonnegative(),
    since: z.string(),
    until: z.string(),
  }),
});

export type ImportTwelveDataResponse = z.infer<
  typeof ImportTwelveDataResponseSchema
>;
