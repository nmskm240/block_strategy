import { Box, Container } from "@mui/material";
import { FeatureCard } from "@/pages/landing/FeatureCard";
import { featureCards } from "@/pages/landing/content";
import { SectionHeading } from "@/pages/landing/SectionHeading";

export function FeaturesSection() {
  return (
    <Box
      id="features"
      sx={{
        bgcolor: "background.paper",
        borderY: "1px solid",
        borderColor: "divider",
      }}
    >
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
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
