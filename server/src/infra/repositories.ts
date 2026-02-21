import type { IOhlcvRepository } from "@server/domain/ohlcv";
import type { DateRange, OHLCV } from "@shared/types";
import type { R2BucketLike } from "./bindings";
import { csvToOhlcvs, ohlcvsToCsv } from "./converters";
import { enumerateDateFileNames, toDateFileName, toR2OhlcvObjectKey } from "./r2ObjectKey";

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

export class R2CsvOhlcvRepository implements IOhlcvRepository {
  constructor(
    private readonly bucket: R2BucketLike,
    private readonly objectPrefix?: string,
  ) {}

  async getOhlcvs(symbol: string, range: DateRange): Promise<OHLCV[]> {
    const ohlcvs: OHLCV[] = [];
    for (const dateFileName of enumerateDateFileNames(range)) {
      const key = toR2OhlcvObjectKey(symbol, dateFileName, this.objectPrefix);
      const object = await this.bucket.get(key);
      if (!object) {
        continue;
      }

      const csv = await object.text();
      ohlcvs.push(...csvToOhlcvs(csv));
    }

    const sinceMs = range.since.getTime();
    const untilMs = range.until.getTime();
    return ohlcvs
      .filter(
        (ohlcv) => ohlcv.timestamp >= sinceMs && ohlcv.timestamp <= untilMs,
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async putOhlcvs(symbol: string, ohlcvs: Iterable<OHLCV>): Promise<void> {
    const grouped = new Map<string, OHLCV[]>();
    for (const ohlcv of ohlcvs) {
      const dateFileName = toDateFileName(ohlcv.timestamp);
      const rows = grouped.get(dateFileName) ?? [];
      rows.push(ohlcv);
      grouped.set(dateFileName, rows);
    }

    for (const [dateFileName, rows] of grouped.entries()) {
      const key = toR2OhlcvObjectKey(symbol, dateFileName, this.objectPrefix);
      const sorted = rows.sort((a, b) => a.timestamp - b.timestamp);
      await this.bucket.put(key, ohlcvsToCsv(sorted));
    }
  }
}
