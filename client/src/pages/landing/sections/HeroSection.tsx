import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export function HeroSection() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 12% 15%, rgba(59,130,246,0.18), transparent 42%), radial-gradient(circle at 88% 18%, rgba(16,185,129,0.14), transparent 46%), linear-gradient(180deg, #0b0f17 0%, #0d1320 48%, #0b0f17 100%)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 6 }}
          alignItems="stretch"
        >
          <Box sx={{ flex: 1.05 }}>
            <Chip
              label="No-code Strategy Builder"
              sx={{
                mb: 2.5,
                bgcolor: "rgba(37,99,235,0.14)",
                color: "primary.light",
                fontWeight: 700,
                borderRadius: 999,
              }}
            />
            <Typography
              component="h1"
              sx={{
                color: "text.primary",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.6rem" },
                maxWidth: 700,
              }}
            >
              戦略を
              <Box component="span" sx={{ color: "primary.main" }}>
                見える化
              </Box>
              して、
              <br />
              検証スピードを上げる
            </Typography>
            <Typography
              sx={{
                mt: 2.5,
                maxWidth: 620,
                color: "text.secondary",
                lineHeight: 1.8,
                fontSize: { xs: 15, md: 17 },
              }}
            >
              TradeLoggerのような「分かりやすく信頼感のあるSaaS LP」を参考に、
              Algraphの強みであるノード型戦略ビルダーとバックテスト可視化を前面に出したランディングページです。
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
              <Button
                component={RouterLink}
                to="/builder"
                size="large"
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "primary.main",
                  boxShadow: "0 12px 28px rgba(37,99,235,0.22)",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                無料で試す
              </Button>
              <Button
                component="a"
                href="#features"
                size="large"
                variant="outlined"
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  color: "text.primary",
                  borderColor: "rgba(148,163,184,0.28)",
                  "&:hover": {
                    borderColor: "rgba(148,163,184,0.4)",
                    bgcolor: "rgba(148,163,184,0.08)",
                  },
                }}
              >
                機能を見る
              </Button>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.5 }}>
              {["ノーコードで開始", "結果を一覧比較", "エクイティカーブ表示"].map(
                (tag) => (
                  <Chip
                    key={tag}
                    label={`✓ ${tag}`}
                    sx={{
                      bgcolor: "background.paper",
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2.5,
                      "& .MuiChip-label": { px: 1.2, fontWeight: 600 },
                    }}
                  />
                ),
              )}
            </Stack>
          </Box>

          <Box sx={{ flex: 0.95, minWidth: 0 }}>
            <Paper
              variant="outlined"
              elevation={0}
              sx={{ p: 2, borderRadius: 5, boxShadow: "0 28px 80px rgba(15,23,42,0.10)" }}
            >
              <Box
                sx={{
                  borderRadius: 4,
                  p: { xs: 2, md: 2.5 },
                  bgcolor: (theme) => theme.palette.custom.surface.subtle,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
                    Strategy Snapshot
                  </Typography>
                  <Chip
                    label="Backtest Ready"
                    size="small"
                    sx={{
                      bgcolor: "rgba(16,185,129,0.16)",
                      color: "#34D399",
                      fontWeight: 700,
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 1.25,
                  }}
                >
                  {[
                    ["勝率", "57.8%"],
                    ["PF", "1.64"],
                    ["最大DD", "-9.2%"],
                    ["取引回数", "184"],
                  ].map(([label, value]) => (
                    <Paper variant="outlined" key={label} elevation={0} sx={{ p: 1.5, borderRadius: 3 }}>
                      <Typography sx={{ color: "text.disabled", fontSize: 12 }}>
                        {label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.5,
                          color: "text.primary",
                          fontWeight: 800,
                          fontSize: 22,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {value}
                      </Typography>
                    </Paper>
                  ))}
                </Box>

                <Paper variant="outlined" elevation={0} sx={{ mt: 1.5, p: 2, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
                      Equity Curve
                    </Typography>
                    <Typography sx={{ color: "primary.main", fontWeight: 700 }}>+18.4%</Typography>
                  </Stack>
                  <Box
                    sx={{
                      mt: 2,
                      height: 132,
                      borderRadius: 2.5,
                      background:
                        "linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0.02) 100%)",
                      border: "1px solid rgba(59,130,246,0.22)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 420 132" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="eq-fill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,114 C34,114 42,106 68,100 C94,94 106,78 128,80 C150,82 170,96 196,88 C224,80 236,50 260,48 C286,46 292,62 318,58 C342,54 360,28 420,18 L420,132 L0,132 Z"
                        fill="url(#eq-fill)"
                      />
                      <path
                        d="M0,114 C34,114 42,106 68,100 C94,94 106,78 128,80 C150,82 170,96 196,88 C224,80 236,50 260,48 C286,46 292,62 318,58 C342,54 360,28 420,18"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Box>
                </Paper>
              </Box>
            </Paper>
          </Box>
        </Stack>

        <Paper
          variant="outlined"
          elevation={0}
          sx={{
            mt: { xs: 5, md: 7 },
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.88),
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
              こんな人に向いています
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {["裁量ルールを言語化したい", "戦略比較を高速化したい", "学習しながら検証したい"].map(
                (item) => (
                  <Chip
                    key={item}
                    label={item}
                    sx={{
                      bgcolor: (theme) => theme.palette.custom.surface.subtle,
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                ),
              )}
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
