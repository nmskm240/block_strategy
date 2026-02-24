import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import { FaqItem } from "@/pages/landing/FaqItem";
import { faqs } from "@/pages/landing/content";

export function CtaFaqSection() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
          gap: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 5,
            border: "1px solid rgba(59,130,246,0.28)",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(17,23,36,0.94) 58%, rgba(16,185,129,0.10))",
          }}
        >
          <Chip
            label="Start Today"
            sx={{
              bgcolor: "background.paper",
              color: "primary.light",
              border: "1px solid rgba(59,130,246,0.22)",
              fontWeight: 700,
            }}
          />
          <Typography
            sx={{
              mt: 2,
              color: "text.primary",
              fontWeight: 900,
              fontSize: { xs: 28, md: 38 },
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            アイデアを、
            <br />
            すぐに検証できる状態へ。
          </Typography>
          <Typography sx={{ mt: 1.5, color: "text.secondary", lineHeight: 1.8, maxWidth: 520 }}>
            LPで価値を理解したら、次は実際に触るだけです。ノードを置いて、条件をつないで、結果を見ながら改善を始めてください。
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
            <Button
              component={RouterLink}
              to="/builder"
              variant="contained"
              size="large"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 800,
                px: 3,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              ビルダーを開いて始める
            </Button>
            <Button
              component="a"
              href="#faq"
              variant="text"
              size="large"
              sx={{ textTransform: "none", fontWeight: 700, color: "text.primary" }}
            >
              よくある質問を見る
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" id="faq" elevation={0} sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 5 }}>
          <Typography sx={{ color: "text.primary", fontWeight: 800, px: 1, pt: 1, pb: 1 }}>
            FAQ
          </Typography>
          {faqs.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </Paper>
      </Box>
    </Container>
  );
}
