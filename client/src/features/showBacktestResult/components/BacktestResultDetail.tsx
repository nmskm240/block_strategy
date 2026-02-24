import { EquityCurveChart } from "@/components/EquityCurveChart";
import { SummaryTable } from "@/components/SummstyTable";
import { BacktestTradeListItem } from "@/features/showBacktestResult/components/BacktestTradeListItem";
import { Box, Divider, List, Paper, Typography } from "@mui/material";
import type { BacktestResult } from "shared";

type Props = {
  result?: BacktestResult;
};

export function BacktestResultDetail({ result }: Props) {
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
        <SummaryTable
          rows={[
            {
              label: "Average Losing Trade",
              value: result?.analysis.averageLosingTrade ?? 0,
            },
            {
              label: "Average Winning Trade",
              value: result?.analysis.averageWinningTrade ?? 0,
            },
            { label: "Expectency", value: result?.analysis.expectency ?? 0 },
            {
              label: "Profit Factor",
              value: result?.analysis.profitFactor ?? 0,
            },
          ]}
        />
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
