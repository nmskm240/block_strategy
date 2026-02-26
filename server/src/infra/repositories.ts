import type { IOhlcvRepository } from "@server/domain/ohlcv";
import type { DateRange, OHLCV } from "@shared/types";

export class DummyOhlcvRepository implements IOhlcvRepository {
  async getOhlcvs(symbol: string, range: DateRange): Promise<OHLCV[]> {
    const ohlcvs: OHLCV[] = [];
    let price = 180;
    for (let i = 0; i < 60; i += 1) {
      const timestamp = range.since.getTime() + i * 60 * 60 * 1000;
      const drift = 0.15;
      const wiggle = Math.sin(i / 5) * 0.8;
      const open = price;
      const close = price + drift + wiggle;
      const high = Math.max(open, close) + 0.5;
      const low = Math.min(open, close) - 0.5;
      const volume = 1000 + i * 3;
      ohlcvs.push({ timestamp, open, high, low, close, volume });
      price = close;
    }
    return Promise.resolve(ohlcvs);
  }

  async putOhlcvs(symbol: string, ohlcvs: Iterable<OHLCV>): Promise<void> {
    void symbol;
    void ohlcvs;
    return Promise.resolve();
  }
}
