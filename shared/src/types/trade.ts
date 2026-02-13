import * as z from "zod";

export type OHLCV = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export const TradeSchema = z.object({
  side: z.enum(["BUY", "SELL"]),
  price: z.number(),
  size: z.number(),
  time: z.string(),
});

export type Trade = z.infer<typeof TradeSchema>;
