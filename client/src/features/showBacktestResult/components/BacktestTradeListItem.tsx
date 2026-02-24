import { SummaryTable } from "@/components/SummstyTable";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { ChevronDownIcon } from "lucide-react";
import type { Trade } from "shared";

export function BacktestTradeListItem(trade: Trade) {
  const isProfit = trade.profit >= 0;

  return (
    <Accordion
      variant="outlined"
      disableGutters
      elevation={0}
      sx={{
        borderRadius: 0.5,
        bgcolor: "background.paper",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDownIcon />}
        sx={{
          minHeight: 0,
          px: 1,
          py: 0.25,
          "& .MuiAccordionSummary-content": {
            my: 0.5,
            minWidth: 0,
            display: "grid",
            alignItems: "center",
            columnGap: 1,
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: trade.direction === "long" ? "success.light" : "error.light",
          }}
        >
          {trade.direction}
        </Typography>
        <Typography sx={{ color: isProfit ? "success.light" : "error.light" }}>
          {trade.profit.toFixed(2)} USD ({trade.profitPct.toFixed(2)}%)
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 1.25, pb: 1, pt: 0 }}>
        <SummaryTable
          rows={[
            { label: "Entry", value: `${trade.entryPrice.toFixed(2)}` },
            { label: "Entry Time", value: trade.entryTime.toLocaleString() },
            { label: "Exit", value: `${trade.exitPrice.toFixed(2)}` },
            { label: "Exit Time", value: trade.exitTime.toLocaleString() },
            { label: "Growth", value: `${trade.growth.toFixed(2)}%` },
            trade.riskPct != null
              ? { label: "Risk %", value: `${trade.riskPct.toFixed(2)}%` }
              : null,
            trade.rmultiple != null
              ? { label: "R Multiple", value: trade.rmultiple.toFixed(2) }
              : null,
          ].filter((row): row is NonNullable<typeof row> => row != null)}
        />
      </AccordionDetails>
    </Accordion>
  );
}
