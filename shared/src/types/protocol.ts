import * as z from "zod";
import { Graph } from "./graph";
import { Timeframe, TradeSchema } from "./trade";

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
