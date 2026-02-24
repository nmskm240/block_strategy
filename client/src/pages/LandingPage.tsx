import { Link as RouterLink } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

const featureCards = [
  {
    title: "ノードで戦略を構築",
    description:
      "売買ロジックをブロックで組み立てるだけ。コードを書く前に、まずは仮説検証を素早く進められます。",
  },
  {
    title: "バックテスト結果を一覧管理",
    description:
      "実行履歴を並べて比較。条件違いの検証結果を見失わず、改善サイクルを回しやすくします。",
  },
  {
    title: "損益・トレード詳細を可視化",
    description:
      "エクイティカーブや各トレードの内訳を確認し、戦略のクセやドローダウン要因を把握できます。",
  },
  {
    title: "学習コストを下げるUI",
    description:
      "初回チュートリアル付きで、初めてでも画面上の操作だけで流れを理解しやすい設計です。",
  },
  {
    title: "高速な試行錯誤に最適化",
    description:
      "条件変更→再実行→比較のループを短く保つため、ビルダーと結果パネルを並列表示しています。",
  },
  {
    title: "戦略アイデアの共有前提",
    description:
      "ロジックを視覚的に説明しやすく、チーム内レビューや将来のテンプレート化にもつなげやすい構成です。",
  },
] as const;

const workflowSteps = [
  {
    label: "1. ルールを配置",
    body: "エントリー・決済条件をノードとして配置し、戦略ロジックの骨格を組み立てます。",
  },
  {
    label: "2. 条件を接続",
    body: "シグナルの流れを可視化しながら接続。ロジックの抜け漏れを画面上で確認できます。",
  },
  {
    label: "3. バックテスト実行",
    body: "その場で実行し、損益推移・トレード一覧を確認。条件違いを繰り返し比較します。",
  },
] as const;

const faqs = [
  {
    q: "プログラミング経験がなくても使えますか？",
    a: "はい。ビルダーはノード接続ベースなので、まずはコードなしで戦略ロジックを試せます。",
  },
  {
    q: "すぐに試せますか？",
    a: "トップページのCTAからビルダー画面へ遷移して、すぐに戦略作成を開始できます。",
  },
  {
    q: "誰向けのツールですか？",
    a: "裁量トレードのルール整理をしたい人、システムトレードの仮説検証を素早く回したい人向けです。",
  },
] as const;

function SectionHeading(props: { eyebrow?: string; title: string; body: string }) {
  return (
    <Stack spacing={1.5} sx={{ mb: 5, maxWidth: 760 }}>
      {props.eyebrow ? (
        <Chip
          label={props.eyebrow}
          sx={{
            width: "fit-content",
            bgcolor: "rgba(59,130,246,0.14)",
            color: "#93C5FD",
            fontWeight: 700,
            borderRadius: 999,
          }}
        />
      ) : null}
      <Typography
        variant="h3"
        sx={{
          color: "#F5F7FB",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontSize: { xs: "2rem", md: "2.6rem" },
          lineHeight: 1.1,
        }}
      >
        {props.title}
      </Typography>
      <Typography
        sx={{
          color: "rgba(255,255,255,0.72)",
          fontSize: { xs: 15, md: 17 },
          lineHeight: 1.75,
        }}
      >
        {props.body}
      </Typography>
    </Stack>
  );
}

export function LandingPage() {
  return (
    <Box component="main" sx={{ color: "#F5F7FB" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 12% 15%, rgba(59,130,246,0.18), transparent 42%), radial-gradient(circle at 88% 18%, rgba(16,185,129,0.14), transparent 46%), linear-gradient(180deg, #0b0f17 0%, #0d1320 48%, #0b0f17 100%)",
          borderBottom: "1px solid rgba(148,163,184,0.16)",
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
                  bgcolor: "rgba(59,130,246,0.14)",
                  color: "#93C5FD",
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              />
              <Typography
                component="h1"
                sx={{
                  color: "#F5F7FB",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.02,
                  fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.6rem" },
                  maxWidth: 700,
                }}
              >
                戦略を
                <Box component="span" sx={{ color: "#2563EB" }}>
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
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.8,
                  fontSize: { xs: 15, md: 17 },
                }}
              >
                TradeLoggerのような「分かりやすく信頼感のあるSaaS LP」を参考に、
                Algraphの強みであるノード型戦略ビルダーとバックテスト可視化を前面に出したランディングページです。
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
                    bgcolor: "#2563EB",
                    boxShadow: "0 12px 28px rgba(37,99,235,0.22)",
                    "&:hover": { bgcolor: "#1D4ED8" },
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
                    color: "#F5F7FB",
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
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: 3.5 }}
              >
                {["ノーコードで開始", "結果を一覧比較", "エクイティカーブ表示"].map(
                  (tag) => (
                    <Chip
                      key={tag}
                      label={`✓ ${tag}`}
                      sx={{
                        bgcolor: "#111724",
                        color: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(148,163,184,0.16)",
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
                sx={{
                  p: 2,
                  borderRadius: 5,
                  boxShadow: "0 28px 80px rgba(15,23,42,0.10)",
                }}
              >
                <Box
                  sx={{
                    borderRadius: 4,
                    p: { xs: 2, md: 2.5 },
                    bgcolor: "#0F1624",
                    border: "1px solid rgba(148,163,184,0.16)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography sx={{ color: "#F5F7FB", fontWeight: 700 }}>
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
                      <Paper
                        variant="outlined"
                        key={label}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                        }}
                      >
                        <Typography sx={{ color: "rgba(255,255,255,0.56)", fontSize: 12 }}>
                          {label}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.5,
                            color: "#F5F7FB",
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

                  <Paper
                    variant="outlined"
                    elevation={0}
                    sx={{
                      mt: 1.5,
                      p: 2,
                      borderRadius: 3,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: "#F5F7FB", fontWeight: 700 }}>
                        Equity Curve
                      </Typography>
                      <Typography sx={{ color: "#2563EB", fontWeight: 700 }}>
                        +18.4%
                      </Typography>
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
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 420 132"
                        preserveAspectRatio="none"
                      >
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
              bgcolor: alpha("#111724", 0.88),
              backdropFilter: "blur(8px)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Typography sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 700 }}>
                こんな人に向いています
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                {["裁量ルールを言語化したい", "戦略比較を高速化したい", "学習しながら検証したい"].map(
                  (item) => (
                    <Chip
                      key={item}
                      label={item}
                      sx={{
                        bgcolor: "#0F1624",
                        color: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(148,163,184,0.16)",
                      }}
                    />
                  ),
                )}
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
        <SectionHeading
          eyebrow="Why Algraph"
          title="検証が止まる原因を、UIで減らす"
          body="参考サイトのように“安心して触れそう”な第一印象を保ちつつ、実際には戦略構築から結果確認までの導線を短くすることに重点を置いたLP構成です。"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Paper
            variant="outlined"
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
            }}
          >
            <Typography sx={{ color: "#F5F7FB", fontWeight: 800, fontSize: 24 }}>
              使い方の流れ
            </Typography>
            <Stack spacing={2} sx={{ mt: 2.5 }}>
              {workflowSteps.map((step, index) => (
                <Box key={step.label}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        mt: 0.3,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(59,130,246,0.22)",
                        color: "#93C5FD",
                        fontWeight: 800,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#F5F7FB", fontWeight: 700 }}>
                        {step.label}
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.75, mt: 0.5 }}>
                        {step.body}
                      </Typography>
                    </Box>
                  </Stack>
                  {index < workflowSteps.length - 1 ? (
                    <Divider sx={{ mt: 2, ml: 5, borderColor: "rgba(148,163,184,0.16)" }} />
                  ) : null}
                </Box>
              ))}
            </Stack>
            <Button
              component={RouterLink}
              to="/builder"
              variant="contained"
              sx={{
                mt: 3,
                textTransform: "none",
                borderRadius: 2.5,
                fontWeight: 700,
                bgcolor: "#2563EB",
                "&:hover": { bgcolor: "#1D4ED8" },
              }}
            >
              ビルダーを開く
            </Button>
          </Paper>

          <Stack spacing={2}>
            <Paper
              variant="outlined"
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
              }}
            >
              <Typography sx={{ color: "#F5F7FB", fontWeight: 700 }}>
                LP設計の意図
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8, mt: 1 }}>
                参考サイトの「視認性の高い余白・控えめなアクセント・短い訴求文」を取り入れ、投資系でも煽り感の少ないトーンに寄せています。
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
              }}
            >
              <Typography sx={{ color: "#F5F7FB", fontWeight: 700 }}>
                すぐ分かる価値
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8, mt: 1 }}>
                「戦略を作る」「結果を比較する」「改善する」の3つが一画面でつながることを、ヒーローと機能一覧で繰り返し伝えます。
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(16,185,129,0.08))",
              }}
            >
              <Typography sx={{ color: "#F5F7FB", fontWeight: 700 }}>
                導線
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8, mt: 1 }}>
                CTAは全て `"/builder"` に集約。LPの目的を「即体験」に絞って離脱を減らします。
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </Container>

      <Box id="features" sx={{ bgcolor: "#111724", borderY: "1px solid rgba(148,163,184,0.16)" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
          <SectionHeading
            eyebrow="Features"
            title="戦略検証に必要な機能を、分かりやすく整理"
            body="参考LPのようなカード型の情報整理を採用し、読み進めるだけでプロダクトの使いどころが伝わる構成にしています。"
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {featureCards.map((feature) => (
              <Card
                variant="outlined"
                key={feature.title}
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "transform 140ms ease, box-shadow 140ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      color: "#93C5FD",
                      bgcolor: "rgba(59,130,246,0.14)",
                      mb: 1.5,
                    }}
                  >
                    {feature.title.slice(0, 1)}
                  </Box>
                  <Typography sx={{ color: "#F5F7FB", fontWeight: 800, mb: 0.8 }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.75 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

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
                bgcolor: "#111724",
                color: "#93C5FD",
                border: "1px solid rgba(59,130,246,0.22)",
                fontWeight: 700,
              }}
            />
            <Typography
              sx={{
                mt: 2,
                color: "#F5F7FB",
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
            <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.8, maxWidth: 520 }}>
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
                  bgcolor: "#2563EB",
                  "&:hover": { bgcolor: "#1D4ED8" },
                }}
              >
                ビルダーを開いて始める
              </Button>
              <Button
                component="a"
                href="#faq"
                variant="text"
                size="large"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "#F5F7FB",
                }}
              >
                よくある質問を見る
              </Button>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            id="faq"
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: 5,
            }}
          >
            <Typography sx={{ color: "#F5F7FB", fontWeight: 800, px: 1, pt: 1, pb: 1 }}>
              FAQ
            </Typography>
            {faqs.map((item) => (
              <Accordion
                key={item.q}
                disableGutters
                elevation={0}
                sx={{
                  bgcolor: "transparent",
                  borderTop: "1px solid rgba(148,163,184,0.16)",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary>
                  <Typography sx={{ color: "#F5F7FB", fontWeight: 700 }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Box>
      </Container>

      <Box sx={{ borderTop: "1px solid rgba(148,163,184,0.16)", bgcolor: "#111724" }}>
        <Container maxWidth="lg" sx={{ py: 3.5 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Typography sx={{ color: "#F5F7FB", fontWeight: 800 }}>
              Algraph
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.56)" }}>
              Visual strategy building and backtesting for faster iteration.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
