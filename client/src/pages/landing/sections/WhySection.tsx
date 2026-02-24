import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { workflowSteps } from "@/pages/landing/content";
import { SectionHeading } from "@/pages/landing/SectionHeading";
import { WorkflowStep } from "@/pages/landing/WorkflowStep";

export function WhySection() {
  return (
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
        <Paper variant="outlined" elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4 }}>
          <Typography sx={{ color: "text.primary", fontWeight: 800, fontSize: 24 }}>
            使い方の流れ
          </Typography>
          <Stack spacing={2} sx={{ mt: 2.5 }}>
            {workflowSteps.map((step, index) => (
              <WorkflowStep
                key={step.label}
                index={index}
                label={step.label}
                body={step.body}
                isLast={index === workflowSteps.length - 1}
              />
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
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            ビルダーを開く
          </Button>
        </Paper>

        <Stack spacing={2}>
          <Paper variant="outlined" elevation={0} sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography sx={{ color: "text.primary", fontWeight: 700 }}>LP設計の意図</Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
              参考サイトの「視認性の高い余白・控えめなアクセント・短い訴求文」を取り入れ、投資系でも煽り感の少ないトーンに寄せています。
            </Typography>
          </Paper>
          <Paper variant="outlined" elevation={0} sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography sx={{ color: "text.primary", fontWeight: 700 }}>すぐ分かる価値</Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
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
            <Typography sx={{ color: "text.primary", fontWeight: 700 }}>導線</Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mt: 1 }}>
              CTAは全て `"/builder"` に集約。LPの目的を「即体験」に絞って離脱を減らします。
            </Typography>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
