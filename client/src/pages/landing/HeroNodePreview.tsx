import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type HeroNodePreviewProps = {
  height?: number;
  framed?: boolean;
  showLabel?: boolean;
  sx?: SxProps<Theme>;
};

export function HeroNodePreview({
  height = 156,
  framed = true,
  showLabel = true,
  sx,
}: HeroNodePreviewProps) {
  return (
    <Box
      sx={{
        mt: framed ? 2 : 0,
        p: framed ? 1.5 : 0,
        borderRadius: framed ? 3 : 0,
        border: framed ? "1px solid" : "none",
        borderColor: "divider",
        bgcolor: framed ? (theme) => theme.palette.custom.surface.subtle : "transparent",
        ...sx,
      }}
    >
      <Box
        sx={{
          borderRadius: framed ? 2.5 : 0,
          overflow: "hidden",
          border: framed ? "1px solid" : "none",
          borderColor: "divider",
          position: "relative",
          height,
          bgcolor: framed ? "background.default" : "transparent",
          p: framed ? 1.25 : 0,
        }}
      >
        {showLabel ? (
          <Typography
            sx={{
              position: "absolute",
              top: framed ? 10 : 12,
              left: framed ? 10 : 12,
              zIndex: 1,
              color: "text.primary",
              fontSize: 12,
              fontWeight: 700,
              px: 1,
              py: 0.4,
              borderRadius: 999,
              bgcolor: "rgba(11,15,23,0.72)",
              border: "1px solid",
              borderColor: framed ? "divider" : "rgba(255,255,255,0.12)",
              backdropFilter: "blur(6px)",
            }}
          >
            Node Editor Preview
          </Typography>
        ) : null}
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
            borderRadius: framed ? 1.5 : 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(11,15,23,0.02) 0%, rgba(11,15,23,0.14) 100%)",
            pointerEvents: "none",
            borderRadius: framed ? 2.5 : 0,
          }}
        />
      </Box>
    </Box>
  );
}
