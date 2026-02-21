import type { DateRange } from "@shared/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeToDayStart(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
    0,
  );
}

export function toDateFileName(timestamp: number): string {
  return new Date(normalizeToDayStart(timestamp)).toISOString().slice(0, 10);
}

export function toR2OhlcvObjectKey(
  symbol: string,
  dateFileName: string,
  prefix?: string,
): string {
  const normalizedPrefix = prefix ? prefix.replace(/\/?$/, "/") : "";
  return `${normalizedPrefix}${symbol}/${dateFileName}.csv`;
}

export function enumerateDateFileNames(range: DateRange): string[] {
  const result: string[] = [];
  const start = normalizeToDayStart(range.since.getTime());
  const end = normalizeToDayStart(range.until.getTime());
  for (let cursor = start; cursor <= end; cursor += DAY_MS) {
    result.push(toDateFileName(cursor));
  }
  return result;
}
