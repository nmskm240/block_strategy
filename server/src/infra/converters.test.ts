import { describe, expect, it } from "bun:test";
import type { OHLCV } from "@shared/types";
import { csvToOhlcvs, ohlcvsToCsv } from "./converters";

describe("infra/converters", () => {
  const sample: OHLCV[] = [
    {
      timestamp: 1735689600000,
      open: 100,
      high: 110,
      low: 90,
      close: 105,
      volume: 1000,
    },
    {
      timestamp: 1735693200000,
      open: 105.5,
      high: 112,
      low: 101,
      close: 108,
      volume: 1200.25,
    },
  ];

  it("OHLCV配列をCSVへ変換し、同値で逆変換できる", () => {
    const csv = ohlcvsToCsv(sample);
    const parsed = csvToOhlcvs(csv);
    expect(parsed).toEqual(sample);
  });

  it("ヘッダーなしCSVも逆変換できる", () => {
    const csv = ohlcvsToCsv(sample, { includeHeader: false });
    const parsed = csvToOhlcvs(csv);
    expect(parsed).toEqual(sample);
  });

  it("timestampがISO文字列でも逆変換できる", () => {
    const csv = [
      "timestamp,open,high,low,close,volume",
      "2025-01-01T00:00:00.000Z,1,2,0.5,1.5,100",
    ].join("\n");

    const parsed = csvToOhlcvs(csv);
    expect(parsed).toEqual([
      {
        timestamp: Date.parse("2025-01-01T00:00:00.000Z"),
        open: 1,
        high: 2,
        low: 0.5,
        close: 1.5,
        volume: 100,
      },
    ]);
  });

  it("列数が不正なCSVは例外を投げる", () => {
    const csv = "timestamp,open,high,low,close,volume\n1,2,3,4,5";
    expect(() => csvToOhlcvs(csv)).toThrow("Invalid CSV format");
  });

  it("数値変換できないCSVは例外を投げる", () => {
    const csv = "timestamp,open,high,low,close,volume\n1,abc,3,4,5,6";
    expect(() => csvToOhlcvs(csv)).toThrow("Invalid numeric value");
  });
});
