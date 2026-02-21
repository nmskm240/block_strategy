import { describe, expect, it } from "bun:test";
import {
  enumerateDateFileNames,
  toDateFileName,
  toR2OhlcvObjectKey,
} from "./r2ObjectKey";

describe("r2OhlcvObjectKey", () => {
  it("timestampからUTC日付ファイル名を生成できる", () => {
    expect(toDateFileName(Date.parse("2025-01-02T23:59:59.999Z"))).toBe(
      "2025-01-02",
    );
  });

  it("R2オブジェクトキーを生成できる", () => {
    expect(toR2OhlcvObjectKey("BTCUSDT", "2025-01-02", "ohlcv")).toBe(
      "ohlcv/BTCUSDT/2025-01-02.csv",
    );
  });

  it("DateRangeから日付ファイル名を列挙できる", () => {
    expect(
      enumerateDateFileNames({
        since: new Date("2025-01-01T12:00:00.000Z"),
        until: new Date("2025-01-03T00:00:00.000Z"),
      }),
    ).toEqual(["2025-01-01", "2025-01-02", "2025-01-03"]);
  });
});
