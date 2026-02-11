import { z } from "zod";

export const ApiResponseSchema = z.object({
  message: z.string(),
  success: z.literal(true),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

export const BacktestRequestSchema = z.object({
  symbol: z.string().trim().min(1, "symbol is required"),
  graph: z.unknown(),
  initialCash: z.number().finite().positive().optional(),
});

export type BacktestRequest = z.infer<typeof BacktestRequestSchema>;

export const BacktestTradeSchema = z.object({
  side: z.enum(["BUY", "SELL"]),
  price: z.number(),
  size: z.number(),
  time: z.string(),
});

export type BacktestTrade = z.infer<typeof BacktestTradeSchema>;

export const BacktestResultSchema = z.object({
  trades: z.array(BacktestTradeSchema),
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
    requestId: z.string().uuid(),
    mql: z.string(),
    result: BacktestResultSchema,
  }),
});

export type BacktestResponse = z.infer<typeof BacktestResponseSchema>;

export const OHLCVSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type OHLCV = z.infer<typeof OHLCVSchema>;
