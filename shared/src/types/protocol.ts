import * as z from "zod";
import { Graph } from "./graph";
import {
  OHLCVSchema,
  SupportedSymbolSchema,
  Timeframe,
  TradeSchema,
} from "./trade";

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

export const BacktestAnalysisSchema = z.object({
  startingCapital: z.number(),
  finalCapital: z.number(),
  profit: z.number(),
  profitPct: z.number(),
  growth: z.number(),
  totalTrades: z.number().int().nonnegative(),
  maxDrawdown: z.number(),
  maxDrawdownPct: z.number(),
  maxRiskPct: z.number().optional(),
  expectency: z.number().optional(),
  rmultipleStdDev: z.number().optional(),
  systemQuality: z.number().optional(),
  profitFactor: z.number().optional(),
  numWinningTrades: z.number().int().nonnegative(),
  numLosingTrades: z.number().int().nonnegative(),
  averageWinningTrade: z.number().optional(),
  averageLosingTrade: z.number().optional(),
});

export const BacktestEnvironmentSchema = z.object({
  symbol: SupportedSymbolSchema,
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
  environment: BacktestEnvironmentSchema,
  trades: z.array(TradeSchema).default([]),
  analysis: BacktestAnalysisSchema,
  equityCurve: z.array(z.number()),
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
