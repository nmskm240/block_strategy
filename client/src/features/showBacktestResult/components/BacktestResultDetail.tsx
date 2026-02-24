import { EquityCurveChart } from "@/components/EquityCurveChart";
import { SummaryTable } from "@/components/SummstyTable";
import { BacktestTradeListItem } from "@/features/showBacktestResult/components/BacktestTradeListItem";
import { Box, Divider, List, Paper, Typography } from "@mui/material";
import type { BacktestResult } from "shared";

type Props = {
  result?: BacktestResult;
};

const ANALYSIS_LABELS: Partial<Record<keyof BacktestResult["analysis"], string>> = {
  startingCapital: "Starting Capital",
  finalCapital: "Final Capital",
  profit: "Total Net Profit",
  profitPct: "Profit %",
  growth: "Growth",
  totalTrades: "Total Number of Trades",
  maxDrawdown: "Max Drawdown",
  maxDrawdownPct: "Max Drawdown %",
  maxRiskPct: "Max Risk %",
  expectency: "Expectancy",
  rmultipleStdDev: "R-Multiple Std Dev",
  systemQuality: "System Quality",
  profitFactor: "Profit Factor",
  numWinningTrades: "Winning Trades",
  numLosingTrades: "Losing Trades",
  averageWinningTrade: "Average Winning Trade",
  averageLosingTrade: "Average Losing Trade",
};

const ANALYSIS_KEYS = Object.keys(
  ANALYSIS_LABELS,
) as Array<keyof BacktestResult["analysis"]>;

function formatAnalysisValue(value: number | undefined, key: string) {
  if (value == null) return "-";
  if (key.toLowerCase().endsWith("pct")) return `${value.toFixed(2)}%`;
  return Number.isInteger(value) ? value : value.toFixed(2);
}

export function BacktestResultDetail({ result }: Props) {
  const analysisRows = ANALYSIS_KEYS.map((key) => ({
    label: ANALYSIS_LABELS[key] ?? key,
    value: formatAnalysisValue(result?.analysis[key], key),
  }));

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          padding: 1.5,
        }}
      >
        <Typography variant="h6">Detail</Typography>
        <Divider />
        <SummaryTable rows={analysisRows} />
        <EquityCurveChart
          trades={result?.trades ?? []}
          equityCurve={result?.equityCurve ?? []}
        />
      </Paper>
      <Paper
        elevation={0}
        sx={{
          padding: 1.5,
        }}
      >
        <Typography variant="h6">Trades</Typography>
        <Divider />
        <Box>
          <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
            {result?.trades.map((trade, index) => (
              <BacktestTradeListItem key={index} {...trade} />
            ))}
          </List>
        </Box>
      </Paper>
    </>
  );
}
