import { BacktestResultDetail } from "@/features/showBacktestResult/components/BacktestResultDetail";
import { BacktestResultSelector } from "@/features/showBacktestResult/components/BacktestResultSelector";
import { Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { BacktestResult } from "shared";

type Props = {
  backtests: BacktestResult[];
};

export function BacktestResultsPanel({ backtests }: Props) {
  const [selectedResult, setSelectedResult] = useState<
    BacktestResult | undefined
  >(undefined);

  useEffect(() => {
    setSelectedResult(backtests[0]);
  }, [backtests]);

  return (
    <Paper
      variant="outlined"
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: 1.25,
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
        <BacktestResultDetail result={selectedResult} />
      </Stack>
    </Paper>
  );
}
