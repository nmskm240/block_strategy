import * as z from "zod";
import { Graph } from "./graph";
import { TradeSchema } from "./trade";

export const BacktestRequestSchema = z.object({
  symbol: z.string().trim().min(1, "symbol is required"),
  graph: Graph,
  initialCash: z.number().finite().positive().optional(),
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
