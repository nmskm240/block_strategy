import { Box, Divider, Stack, Typography } from "@mui/material";

type WorkflowStepProps = {
  index: number;
  label: string;
  body: string;
  isLast: boolean;
};

export function WorkflowStep({
  index,
  label,
  body,
  isLast,
}: WorkflowStepProps) {
  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            mt: 0.3,
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(37,99,235,0.22)",
            color: "primary.light",
            fontWeight: 800,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Box>
        <Box>
          <Typography sx={{ color: "text.primary", fontWeight: 700 }}>{label}</Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.75, mt: 0.5 }}>
            {body}
          </Typography>
        </Box>
      </Stack>
      {isLast ? null : (
        <Divider sx={{ mt: 2, ml: 5, borderColor: "divider" }} />
      )}
    </Box>
  );
}
