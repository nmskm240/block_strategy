import { Box } from "@mui/material";
import { CtaFaqSection } from "@/pages/landing/sections/CtaFaqSection";
import { FeaturesSection } from "@/pages/landing/sections/FeaturesSection";
import { HeroSection } from "@/pages/landing/sections/HeroSection";
import { LandingFooter } from "@/pages/landing/sections/LandingFooter";
import { WhySection } from "@/pages/landing/sections/WhySection";

export function LandingPage() {
  return (
    <Box component="main" sx={{ color: "text.primary" }}>
      <HeroSection />
      <WhySection />
      <FeaturesSection />
      <CtaFaqSection />
      <LandingFooter />
    </Box>
  );
}
