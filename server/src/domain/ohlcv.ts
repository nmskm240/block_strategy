import type { DateRange, OHLCV, Timeframe } from "@shared/types";
import { match } from "ts-pattern";

export interface IOhlcvRepository {
  getOhlcvs(symbol: string, range: DateRange): Promise<OHLCV[]>;
  putOhlcvs(symbol: string, ohlcvs: Iterable<OHLCV>): Promise<void>;
}

function toMillSec(timeframe: Timeframe) {
  return match(timeframe)
    .with("1min", () => 60 * 1000)
    .with("5min", () => 5 * 60 * 1000)
    .with("15min", () => 15 * 60 * 1000)
    .with("30min", () => 30 * 60 * 1000)
    .with("1h", () => 60 * 60 * 1000)
    .with("4h", () => 4 * 60 * 60 * 1000)
    .with("1day", () => 24 * 60 * 60 * 1000)
    .exhaustive();
}

export function resampleOhlcvs(
  ohlcvs: Iterable<OHLCV>,
  timeframe: Timeframe,
): OHLCV[] {
  const source = Array.from(ohlcvs).sort((a, b) => a.timestamp - b.timestamp);
  if (source.length === 0) {
    return [];
  }

  const intervalMs = toMillSec(timeframe);
  if (timeframe === "1min") {
    return source;
  }

  const result: OHLCV[] = [];
  let currentBucketStart = -1;
  let current: OHLCV | null = null;

  for (const ohlcv of source) {
    const bucketStart = Math.floor(ohlcv.timestamp / intervalMs) * intervalMs;
    if (!current || bucketStart !== currentBucketStart) {
      if (current) {
        result.push(current);
      }
      currentBucketStart = bucketStart;
      current = {
        timestamp: bucketStart,
        open: ohlcv.open,
        high: ohlcv.high,
        low: ohlcv.low,
        close: ohlcv.close,
        volume: ohlcv.volume,
      };
      continue;
    }

    current.high = Math.max(current.high, ohlcv.high);
    current.low = Math.min(current.low, ohlcv.low);
    current.close = ohlcv.close;
    current.volume += ohlcv.volume;
  }

  if (current) {
    result.push(current);
  }

  return result;
}
