import { EquityCurveChart } from "@/components/EquityCurveChart";
import { SummaryTable } from "@/components/SummstyTable";
import { BacktestPrimaryAnalysisCards } from "@/features/showBacktestResult/components/BacktestPrimaryAnalysisCards";
import { BacktestTradeListItem } from "@/features/showBacktestResult/components/BacktestTradeListItem";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  Paper,
  Typography,
} from "@mui/material";
import { ChevronDownIcon } from "lucide-react";
import type { BacktestResult } from "shared";

type Props = {
  result?: BacktestResult;
};

const ANALYSIS_LABELS: Partial<
  Record<keyof BacktestResult["analysis"], string>
> = {
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

const ANALYSIS_KEYS = Object.keys(ANALYSIS_LABELS) as Array<
  keyof BacktestResult["analysis"]
>;

const PRIMARY_ANALYSIS_KEYS: Array<keyof BacktestResult["analysis"]> = [
  "profit",
  "profitPct",
  "growth",
  "totalTrades",
  "maxDrawdownPct",
  "profitFactor",
];

function formatAnalysisValue(value: number | undefined, key: string) {
  if (value == null) return "-";
  if (key.toLowerCase().endsWith("pct")) return `${value.toFixed(2)}%`;
  return Number.isInteger(value) ? value : value.toFixed(2);
}

export function BacktestResultDetail({ result }: Props) {
  const analysisRows = ANALYSIS_KEYS.map((key) => ({
    label: ANALYSIS_LABELS[key] ?? key,
    rawValue: result?.analysis[key],
    value: formatAnalysisValue(result?.analysis[key], key),
    key,
  }));
  const primaryAnalysisRows = analysisRows.filter((row) =>
    PRIMARY_ANALYSIS_KEYS.includes(row.key),
  );
  const additionalAnalysisRows = analysisRows.filter(
    (row) => !PRIMARY_ANALYSIS_KEYS.includes(row.key),
  );

  return (
    <>
      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          padding: 1.5,
        }}
      >
        <Typography variant="h6">Analysis</Typography>
        <Divider />
        <BacktestPrimaryAnalysisCards
          rows={primaryAnalysisRows.map(({ key, label, rawValue }) => ({
            key,
            label,
            rawValue,
          }))}
        />
        {additionalAnalysisRows.length > 0 && (
          <Accordion
            variant="outlined"
            disableGutters
            elevation={0}
            sx={{
              mt: 1,
              borderRadius: 0.5,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ChevronDownIcon />}
              sx={{
                minHeight: 0,
                px: 1.25,
                "& .MuiAccordionSummary-content": {
                  my: 1,
                },
              }}
            >
              <Typography variant="body2">more analysis</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1.25, pb: 1, pt: 0 }}>
              <SummaryTable
                rows={additionalAnalysisRows.map(({ label, value }) => ({
                  label,
                  value,
                }))}
              />
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>
      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          padding: 1.5,
        }}
      >
        <Typography variant="h6">EquityCurve</Typography>
        <Divider sx={{ my: 1 }} />
        <EquityCurveChart
          trades={result?.trades ?? []}
          equityCurve={result?.equityCurve ?? []}
        />
      </Paper>
      <Paper
        variant="outlined"
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
