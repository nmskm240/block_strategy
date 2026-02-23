import { Box, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

type SummaryRow = {
  label: string;
  value: ReactNode;
  valueColor?: string;
};

export function SummaryTable({ rows }: { rows: SummaryRow[] }) {
  return (
    <Stack spacing={0.5}>
      {rows.map((row) => (
        <SummaryTableRow
          key={row.label}
          label={row.label}
          value={row.value}
          valueColor={row.valueColor}
        />
      ))}
    </Stack>
  );
}

export function SummaryTableRow({ label, value, valueColor }: SummaryRow) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
      <Typography variant="caption">{label}</Typography>
      <Typography
        variant="caption"
        sx={{
          color: valueColor,
          overflow: "hidden",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
