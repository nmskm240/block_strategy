import { useMemo, useRef } from "react";
import { DayPicker, type DateRange as DayPickerDateRange } from "react-day-picker";
import type { DateRange } from "shared";
import "react-day-picker/dist/style.css";
import "@/styles/components/dateRangePicker.css";

type DateRangePickerProps = {
  value: DateRange;
  onChange: (value: DateRange) => void;
  fromYear?: number;
  toYear?: number;
};

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function DateRangePicker({
  value,
  onChange,
  fromYear = 2000,
  toYear = new Date().getFullYear() + 1,
}: DateRangePickerProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  const selectedRange = useMemo<DayPickerDateRange>(() => {
    return {
      from: value.since,
      to: value.until,
    };
  }, [value.since, value.until]);

  const summaryLabel =
    toDateString(value.since) === toDateString(value.until)
      ? toDateString(value.since)
      : `${toDateString(value.since)} ~ ${toDateString(value.until)}`;

  return (
    <details ref={detailsRef} className="date-range-picker">
      <summary className="date-range-picker__summary">{summaryLabel}</summary>
      <div className="date-range-picker__popover">
        <DayPicker
          mode="range"
          selected={selectedRange}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          onSelect={(range) => {
            if (!range?.from) return;
            const since = toDate(toDateString(range.from));
            const until = toDate(toDateString(range.to ?? range.from));
            if (!since || !until) return;
            onChange({ since, until });
            if (range.to && detailsRef.current) {
              detailsRef.current.open = false;
            }
          }}
        />
      </div>
    </details>
  );
}
