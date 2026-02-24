import type { DateRange, Timeframe } from "shared";

function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
  );
}

function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
  );
}

export function getMaxBacktestRangeDays(timeframe: Timeframe): number {
  switch (timeframe) {
    case "1day":
      return 3650; // ~10 years
    case "1h":
    case "4h":
      return 183; // ~6 months
    case "15min":
      return 31; // ~1 month
    case "1min":
    case "5min":
    case "30min":
    default:
      return 31;
  }
}

export function getBacktestRangeLimitLabel(timeframe: Timeframe): string {
  switch (timeframe) {
    case "1day":
      return "最大10年";
    case "1h":
    case "4h":
      return "最大半年";
    default:
      return "最大1ヶ月";
  }
}

export function clampDateRangeToTimeframe(
  range: DateRange,
  timeframe: Timeframe,
): DateRange {
  const since = startOfDay(range.since);
  const until = endOfDay(range.until);
  const maxDays = getMaxBacktestRangeDays(timeframe);
  const maxUntil = endOfDay(
    new Date(
      since.getFullYear(),
      since.getMonth(),
      since.getDate() + (maxDays - 1),
    ),
  );

  if (until.getTime() <= maxUntil.getTime()) {
    return { since, until };
  }

  return {
    since,
    until: maxUntil,
  };
}

export function normalizeDateRange(range: DateRange): DateRange {
  return {
    since: startOfDay(range.since),
    until: endOfDay(range.until),
  };
}

export function getDateRangeLimitError(
  range: DateRange,
  timeframe: Timeframe,
): string | null {
  const normalized = normalizeDateRange(range);
  const maxDays = getMaxBacktestRangeDays(timeframe);
  const dayMs = 24 * 60 * 60 * 1000;
  const selectedDays =
    Math.floor(
      (normalized.until.getTime() - normalized.since.getTime()) / dayMs,
    ) + 1;

  if (selectedDays > maxDays) {
    return `期間が長すぎます（${getBacktestRangeLimitLabel(timeframe)}）`;
  }

  return null;
}
