import { BacktestResultDetail } from "@/features/showBacktestResult/components/BacktestResultDetail";
import { BacktestResultSelector } from "@/features/showBacktestResult/components/BacktestResultSelector";
import { Box, Collapse, Link, Paper, Stack, Typography } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import type { BacktestResult } from "shared";

type Props = {
  backtests: BacktestResult[];
};

export function BacktestResultsPanel({ backtests }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedResult, setSelectedResult] = useState<
    BacktestResult | undefined
  >(undefined);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  useEffect(() => {
    setSelectedResult(backtests[0]);
  }, [backtests]);

  useEffect(() => {
    if (isMobile && backtests.length > 0) {
      setIsMobileExpanded(true);
    }
  }, [backtests.length, isMobile]);

  const isExpanded = !isMobile || isMobileExpanded;

  return (
    <Paper
      variant="outlined"
      elevation={0}
      sx={{
        width: "100%",
        height: isMobile ? "auto" : "100%",
        maxHeight: isMobile ? (isExpanded ? "48dvh" : "auto") : "none",
        borderRadius: isMobile ? "14px 14px 0 0" : 1.25,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isMobile && (
        <Box
          component="button"
          type="button"
          onClick={() => setIsMobileExpanded((prev) => !prev)}
          aria-expanded={isMobileExpanded}
          aria-label={
            isMobileExpanded
              ? "Collapse backtest results panel"
              : "Expand backtest results panel"
          }
          sx={{
            border: 0,
            background: "transparent",
            width: "100%",
            cursor: "pointer",
            pt: 0.75,
            pb: 0.25,
            px: 2,
          }}
        >
          <Box
            sx={{
              mx: "auto",
              width: 44,
              height: 5,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.35)",
            }}
          />
        </Box>
      )}

      <Typography variant="h5" padding={2} paddingTop={isMobile ? 1 : 2}>
        Backtest
      </Typography>

      <Collapse in={isExpanded} timeout={180} unmountOnExit={false}>
        <Stack
          spacing={1}
          sx={{
            p: 1.5,
            pt: 0,
            minHeight: 0,
            overflow: "auto",
            maxHeight: isMobile ? "calc(48dvh - 72px)" : "none",
          }}
        >
          <BacktestResultSelector
            backtests={backtests}
            selectedResult={selectedResult}
            onSelectResult={setSelectedResult}
          />
          <BacktestResultDetail result={selectedResult} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ pt: 1, px: 0.5, textAlign: "right" }}
          >
            Data provided by{" "}
            <Link
              href="https://twelvedata.com"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="inherit"
            >
              Twelve Data
            </Link>
          </Typography>
        </Stack>
      </Collapse>
    </Paper>
  );
}
