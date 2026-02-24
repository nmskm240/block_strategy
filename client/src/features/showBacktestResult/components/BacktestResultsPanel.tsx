import { BacktestResultDetail } from "@/features/showBacktestResult/components/BacktestResultDetail";
import { BacktestResultSelector } from "@/features/showBacktestResult/components/BacktestResultSelector";
import { Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { BacktestResult } from "shared";

type Props = {
  backtests: BacktestResult[];
};

export function BacktestResultsPanel({ backtests }: Props) {
  const [selectedResult, setSelectedResult] = useState<BacktestResult | null>(null);

  useEffect(() => {
    setSelectedResult(backtests[0] ?? null);
  }, [backtests]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "rgba(12, 12, 16, 0.92)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 1.25,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
        overflow: "hidden",
        color: "#2c2c2c",
        fontSize: 12,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h5" padding={2}>
        Backtest
      </Typography>

      <Stack spacing={1} sx={{ p: 1.5, minHeight: 0, overflow: "auto" }}>
        <BacktestResultSelector
          backtests={backtests}
          selectedResult={selectedResult}
          onSelectResult={setSelectedResult}
        />
        {selectedResult ? <BacktestResultDetail result={selectedResult} /> : null}
      </Stack>
    </Paper>
  );
}
