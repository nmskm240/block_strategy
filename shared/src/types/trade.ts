import * as z from "zod";

export const OHLCVSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type OHLCV = z.infer<typeof OHLCVSchema>;

export const OhlcvKind = z.enum(["OPEN", "HIHG", "LOW", "CLOSE", "VOLUME"]);

export type OhlcvKind = z.infer<typeof OhlcvKind>;

export const TradeSide = z.enum(["BUY", "SELL"]);

export type TradeSide = z.infer<typeof TradeSide>;

export const Timeframe = z.enum(["1m", "5m", "15m", "30m", "1h", "4h", "1d"]);

export type Timeframe = z.infer<typeof Timeframe>;

export const TradeSchema = z.object({
  side: TradeSide,
  price: z.number(),
  time: z.string(),
});

export type Trade = z.infer<typeof TradeSchema>;
