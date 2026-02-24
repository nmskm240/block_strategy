import {
  getBacktestRangeLimitLabel,
  normalizeDateRange,
} from "@/features/runBacktest/dateRangeLimit";
import { Box, Button, Popover } from "@mui/material";
import { useMemo, useState } from "react";
import {
  DayPicker,
  type DateRange as DayPickerDateRange,
} from "react-day-picker";
import type { DateRange, Timeframe } from "shared";
import "react-day-picker/dist/style.css";

type DateRangePickerProps = {
  value: DateRange;
  timeframe: Timeframe;
  onChange: (value: DateRange) => void;
};

export function DateRangePicker({
  value,
  timeframe,
  onChange,
}: DateRangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const selectedRange = useMemo<DayPickerDateRange>(() => {
    return {
      from: value.since,
      to: value.until,
    };
  }, [value.since, value.until]);

  const summaryLabel =
    value.since.getTime() === value.until.getTime()
      ? value.since.toLocaleDateString()
      : `${value.since.toLocaleDateString()} ~ ${value.until.toLocaleDateString()}`;

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <Button
        type="button"
        variant="outlined"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          justifyContent: "flex-start",
          borderRadius: 1,
        }}
      >
        {summaryLabel}
      </Button>
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 1,
            },
          },
        }}
      >
        <Box>
          <DayPicker
            mode="range"
            selected={selectedRange}
            captionLayout="dropdown"
            onSelect={(range) => {
              if (range?.from) {
                const since = new Date(
                  range.from.getFullYear(),
                  range.from.getMonth(),
                  range.from.getDate(),
                  0,
                  0,
                  0,
                );
                const until = new Date(
                  range.to?.getFullYear() ?? range.from.getFullYear(),
                  range.to?.getMonth() ?? range.from.getMonth(),
                  range.to?.getDate() ?? range.from.getDate(),
                  23,
                  59,
                  59,
                );
                onChange(normalizeDateRange({ since, until }));
              }
            }}
          />
          <Box
            sx={{
              px: 1,
              pb: 0.5,
              pt: 0.25,
              fontSize: 12,
              color: "text.disabled",
            }}
          >
            {getBacktestRangeLimitLabel(timeframe)}
          </Box>
        </Box>
      </Popover>
    </>
  );
}
