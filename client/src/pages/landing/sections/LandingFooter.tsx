import { Box, Container, Stack, Typography } from "@mui/material";

export function LandingFooter() {
  return (
    <Box sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Container maxWidth="lg" sx={{ py: 3.5 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Typography sx={{ color: "text.primary", fontWeight: 800 }}>Algraph</Typography>
          <Typography sx={{ color: "text.disabled" }}>
            Visual strategy building and backtesting for faster iteration.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
