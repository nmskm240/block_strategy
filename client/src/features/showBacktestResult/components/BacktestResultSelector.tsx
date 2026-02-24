import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { BacktestResult } from "shared";

type Props = {
  backtests: BacktestResult[];
  selectedResult?: BacktestResult;
  onSelectResult: (result: BacktestResult) => void;
};

export function BacktestResultSelector({
  backtests,
  selectedResult,
  onSelectResult,
}: Props) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="backtest-results-select-label">Result</InputLabel>
      <Select
        labelId="backtest-results-select-label"
        label="Result"
        value={selectedResult ? JSON.stringify(selectedResult) : ""}
        onChange={(event) => onSelectResult(JSON.parse(event.target.value))}
        disabled={backtests.length === 0}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "#101722",
            },
          },
        }}
        sx={{
          bgcolor: "rgba(255,255,255,0.06)",
          borderRadius: 0.75,
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.2)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.3)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#90caf9",
          },
          ".MuiSvgIcon-root": { color: "#fff" },
        }}
      >
        {backtests.map((item) => {
          return (
            <MenuItem
              key={JSON.stringify(item)}
              value={JSON.stringify(item)}
              sx={{
                whiteSpace: "normal",
                lineHeight: 1.25,
                fontSize: 12,
              }}
            >
              {`${item.environment.symbol} | ${
                item.environment.timeframe
              } | ${item.environment.testRange.since.toLocaleDateString()} ~ ${item.environment.testRange.until.toLocaleDateString()} | PnL ${item.analysis.profit.toFixed(
                2,
              )}`}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
