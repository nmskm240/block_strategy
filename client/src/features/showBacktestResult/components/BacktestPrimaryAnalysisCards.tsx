import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CountUp from "react-countup";
import type { BacktestResult } from "shared";

export type PrimaryAnalysisRow = {
  key: keyof BacktestResult["analysis"];
  label: string;
  rawValue: number | undefined;
};

function getAnalysisResultTone(
  key: keyof BacktestResult["analysis"],
  value: number | undefined,
): "good" | "bad" | "neutral" {
  if (value == null) return "neutral";

  if (key === "profit" || key === "profitPct" || key === "growth") {
    return value >= 0 ? "good" : "bad";
  }

  if (key === "profitFactor") {
    return value >= 1 ? "good" : "bad";
  }

  if (key === "maxDrawdownPct") {
    // Heuristic: lower drawdown is better. <= 20% is treated as good here.
    return value <= 20 ? "good" : "bad";
  }

  return "neutral";
}

function AnimatedAnalysisValue({
  value,
  analysisKey,
}: {
  value: number | undefined;
  analysisKey: keyof BacktestResult["analysis"];
}) {
  if (value == null) return <>-</>;

  const isPercent = analysisKey.toLowerCase().endsWith("pct");
  const decimals = Number.isInteger(value) ? 0 : 2;

  return (
    <CountUp
      key={`${analysisKey}-${value}`}
      end={value}
      duration={0.7}
      decimals={decimals}
      suffix={isPercent ? "%" : ""}
      separator=","
      preserveValue={false}
    />
  );
}

export function BacktestPrimaryAnalysisCards({
  rows,
}: {
  rows: PrimaryAnalysisRow[];
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 1,
        display: "grid",
        gap: 1,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
      }}
    >
      {rows.map(({ key, label, rawValue }) => {
        const resultTone = getAnalysisResultTone(key, rawValue);
        const valueColor =
          resultTone === "good"
            ? theme.palette.success.dark
            : resultTone === "bad"
              ? theme.palette.error.dark
              : theme.palette.text.primary;

        return (
          <Paper
            key={key}
            variant="outlined"
            elevation={0}
            sx={{
              p: 1.25,
              borderRadius: 1,
              display: "grid",
              gap: 0.25,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                lineHeight: 1.2,
                color: valueColor,
              }}
            >
              <AnimatedAnalysisValue value={rawValue} analysisKey={key} />
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
