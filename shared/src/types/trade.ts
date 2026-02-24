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

export const SupportedSymbolSchema = z.enum([
  "EUR/USD",
  "USD/JPY",
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "TSLA",
  "SPY",
  "XAU/USD",
  "BTC/USD",
  "ETH/USD",
]);

export const SUPPORTED_SYMBOLS = SupportedSymbolSchema.options;

export type SupportedSymbol = z.infer<typeof SupportedSymbolSchema>;

export const OhlcvKind = z.enum(["OPEN", "HIHG", "LOW", "CLOSE", "VOLUME"]);

export type OhlcvKind = z.infer<typeof OhlcvKind>;

export const Timeframe = z.enum([
  "1min",
  "5min",
  "15min",
  "30min",
  "1h",
  "4h",
  "1day",
]);

export type Timeframe = z.infer<typeof Timeframe>;

export const TradeSchema = z.object({
  direction: z.enum(["long", "short"]),
  entryTime: z.coerce.date(),
  entryPrice: z.number(),
  exitTime: z.coerce.date(),
  exitPrice: z.number(),
  profit: z.number(),
  profitPct: z.number(),
  growth: z.number(),
  riskPct: z.number().optional(),
  rmultiple: z.number().optional(),
});

export type Trade = z.infer<typeof TradeSchema>;
