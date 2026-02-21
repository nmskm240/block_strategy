import { describe, expect, it } from "bun:test";
import type { OHLCV } from "@shared/types";
import { R2CsvOhlcvRepository } from "./repositories";
import type { R2BucketLike } from "./bindings";

class InMemoryBucket implements R2BucketLike {
  private readonly store = new Map<string, string>();

  keys(): string[] {
    return Array.from(this.store.keys()).sort();
  }

  async get(key: string): Promise<{ text(): Promise<string> } | null> {
    const value = this.store.get(key);
    if (value == null) {
      return null;
    }
    return {
      text: async () => value,
    };
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

describe("R2CsvOhlcvRepository", () => {
  it("putしたOHLCVをgetで取得できる", async () => {
    const bucket = new InMemoryBucket();
    const repo = new R2CsvOhlcvRepository(bucket, "ohlcv");
    const rows: OHLCV[] = [
      {
        timestamp: Date.parse("2025-01-01T00:00:00.000Z"),
        open: 1,
        high: 2,
        low: 0.5,
        close: 1.5,
        volume: 10,
      },
      {
        timestamp: Date.parse("2025-01-01T01:00:00.000Z"),
        open: 2,
        high: 3,
        low: 1.5,
        close: 2.5,
        volume: 20,
      },
    ];

    await repo.putOhlcvs("BTCUSDT", rows);
    expect(bucket.keys()).toEqual(["ohlcv/BTCUSDT/2025-01-01.csv"]);

    const actual = await repo.getOhlcvs("BTCUSDT", {
      since: new Date("2025-01-01T00:00:00.000Z"),
      until: new Date("2025-01-01T02:00:00.000Z"),
    });

    expect(actual).toEqual(rows);
  });

  it("異なる日付は別ファイルに分割して保存される", async () => {
    const bucket = new InMemoryBucket();
    const repo = new R2CsvOhlcvRepository(bucket, "ohlcv");
    await repo.putOhlcvs("SOLUSDT", [
      {
        timestamp: Date.parse("2025-01-01T23:30:00.000Z"),
        open: 1,
        high: 2,
        low: 0.5,
        close: 1.5,
        volume: 10,
      },
      {
        timestamp: Date.parse("2025-01-02T00:30:00.000Z"),
        open: 2,
        high: 3,
        low: 1.5,
        close: 2.5,
        volume: 20,
      },
    ]);

    expect(bucket.keys()).toEqual([
      "ohlcv/SOLUSDT/2025-01-01.csv",
      "ohlcv/SOLUSDT/2025-01-02.csv",
    ]);
  });

  it("取得時にDateRangeでフィルタされる", async () => {
    const repo = new R2CsvOhlcvRepository(new InMemoryBucket(), "ohlcv");
    await repo.putOhlcvs("ETHUSDT", [
      {
        timestamp: Date.parse("2025-01-01T00:00:00.000Z"),
        open: 1,
        high: 2,
        low: 0.5,
        close: 1.5,
        volume: 10,
      },
      {
        timestamp: Date.parse("2025-01-01T01:00:00.000Z"),
        open: 2,
        high: 3,
        low: 1.5,
        close: 2.5,
        volume: 20,
      },
    ]);

    const actual = await repo.getOhlcvs("ETHUSDT", {
      since: new Date("2025-01-01T00:30:00.000Z"),
      until: new Date("2025-01-01T01:00:00.000Z"),
    });

    expect(actual).toEqual([
      {
        timestamp: Date.parse("2025-01-01T01:00:00.000Z"),
        open: 2,
        high: 3,
        low: 1.5,
        close: 2.5,
        volume: 20,
      },
    ]);
  });
});
