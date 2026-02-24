import type { DateRange, OHLCV, Timeframe, SupportedSymbol } from "shared";

export interface OhlcvFetcher {
  fetchOhlcvs(
    symbol: SupportedSymbol,
    timeframe: Timeframe,
    range: DateRange,
  ): Promise<OHLCV[]>;
}
