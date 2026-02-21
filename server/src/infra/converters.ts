import type { OHLCV } from "@shared/types";

const OHLCV_CSV_HEADER = "timestamp,open,high,low,close,volume";
const OHLCV_CSV_COLUMN_COUNT = 6;

function parseTimestamp(value?: string): number {
  if (value === undefined) {
    throw new Error("Missing timestamp value");
  }
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    return asNumber;
  }

  const asDate = Date.parse(value);
  if (!Number.isNaN(asDate)) {
    return asDate;
  }

  throw new Error(`Invalid timestamp: "${value}"`);
}

export function ohlcvsToCsv(
  ohlcvs: Iterable<OHLCV>,
  options?: {
    includeHeader?: boolean;
  },
): string {
  const includeHeader = options?.includeHeader ?? true;
  const lines: string[] = includeHeader ? [OHLCV_CSV_HEADER] : [];

  for (const ohlcv of ohlcvs) {
    lines.push(
      [
        ohlcv.timestamp,
        ohlcv.open,
        ohlcv.high,
        ohlcv.low,
        ohlcv.close,
        ohlcv.volume,
      ].join(","),
    );
  }

  return lines.join("\n");
}

export function csvToOhlcvs(csv: string): OHLCV[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const firstLine = lines[0];
  if (!firstLine) {
    return [];
  }
  const hasHeader = firstLine.toLowerCase() === OHLCV_CSV_HEADER;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, index) => {
    const columns = line.split(",").map((value) => value.trim());
    if (columns.length !== OHLCV_CSV_COLUMN_COUNT) {
      throw new Error(
        `Invalid CSV format at line ${
          index + (hasHeader ? 2 : 1)
        }: expected ${OHLCV_CSV_COLUMN_COUNT} columns`,
      );
    }

    const [timestamp, open, high, low, close, volume] = columns;
    const parsed = {
      timestamp: parseTimestamp(timestamp),
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume),
    } satisfies OHLCV;

    if (Object.values(parsed).some((value) => !Number.isFinite(value))) {
      throw new Error(
        `Invalid numeric value at line ${index + (hasHeader ? 2 : 1)}`,
      );
    }

    return parsed;
  });
}
