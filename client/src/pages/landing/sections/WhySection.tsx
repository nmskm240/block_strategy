import {
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export function WhySection() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
      <Stack spacing={1.25} sx={{ mb: 5, maxWidth: 860 }}>
        <Typography
          sx={{
            color: "text.primary",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            fontSize: { xs: "1.9rem", md: "2.4rem" },
            lineHeight: 1.1,
          }}
        >
          なぜ、戦略づくりは複雑になるのか。
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            fontSize: { xs: 15, md: 16 },
          }}
        >
          こんな経験はありませんか？
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        <Paper
          variant="outlined"
          elevation={0}
          sx={{ p: 2.5, borderRadius: 4 }}
        >
          <Typography sx={{ color: "text.primary", fontWeight: 800 }}>
            😕 教わった戦略が、再現できない
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
            文章では分かるのに、自分で組むとズレる。
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          elevation={0}
          sx={{ p: 2.5, borderRadius: 4 }}
        >
          <Typography sx={{ color: "text.primary", fontWeight: 800 }}>
            😵‍💫 戦略が複雑化してブラックボックスになる
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
            条件を足すほど、全体像が見えなくなる。
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.06))",
          }}
        >
          <Typography sx={{ color: "text.primary", fontWeight: 800 }}>
            😢 ロジックはあるのに、コードが書けない
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
            検証に進む前で止まる。
          </Typography>
        </Paper>
      </Box>
      <Divider
        sx={{
          borderColor: "divider",
          marginY: 2,
        }}
      />

      <Stack
        spacing={2}
        sx={{
          mt: 3,
        }}
      >
        <Paper
          variant="outlined"
          elevation={0}
          sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4 }}
        >
          <Typography
            sx={{ color: "text.primary", fontWeight: 800, fontSize: 20 }}
          >
            Algraphは、ノーコードだからこそ
            <Box component="span" sx={{ color: "primary.light", ml: 0.5 }}>
              戦略を可視化しやすい
            </Box>
          </Typography>
          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.9, mt: 1.25 }}
          >
            条件をノードとして配置し、接続でロジックの流れを表現するので、頭の中のルールをそのまま画面に出せます。
            文章や口頭で共有しづらい戦略でも、構造で見せられるのが強みです。
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.9, mt: 1 }}>
            さらに、作成した戦略をその場でバックテストして結果を確認できるので、「作る」と「検証する」が分断されません。
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}
