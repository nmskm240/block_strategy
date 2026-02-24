import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";

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
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ position: "relative" }}
        >
          <Box sx={{ flex: 0.98, position: "relative", zIndex: 2 }}>
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
              裁量を、
              <Box component="span" sx={{ color: "primary.main" }}>
                構造
              </Box>
              に。
              <br />
              ノードで組んで
              <br />
              そのまま検証
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
              考える → 試す → 改善する。
              <br />
              Algraphは、売買ルールをノードで組み立て、そのままバックテストと結果比較まで進められる戦略ビルダーです。
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 4 }}
            >
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
                戦略作成を始める
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
                機能一覧
              </Button>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 3.5 }}
            >
              {["ノーコード", "ブラウザ完結"].map((tag) => (
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
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1.02,
              minWidth: 0,
              position: "relative",
              zIndex: 1,
              display: { xs: "block", md: "flex" },
              justifyContent: "flex-end",
            }}
          >
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                top: { md: 0, lg: 0 },
                left: { md: 18, lg: -248 },
                right: { md: -16, lg: -6 },
                bottom: { md: -8, lg: -20 },
                pointerEvents: "none",
              }}
            >
              <Box
                sx={{
                  borderColor: "divider",
                  bgcolor: "transparent",
                  position: "relative",
                  height: 640,
                  width: "100%",
                  opacity: 0.97,
                  filter: "drop-shadow(0 44px 56px rgba(0,0,0,0.24))",
                  transform: {
                    md: "rotate(-4deg) translate(22px, -100px) scale(1)",
                    lg: "rotate(-5deg) translate(30px, -104px) scale(1.1)",
                  },
                  transformOrigin: "center center",
                }}
              >
                <Box
                  component="img"
                  src="/hero-editor-preview.webp"
                  alt="Algraph node editor preview"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center top",
                    display: "block",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
