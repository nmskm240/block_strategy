import { Box, Card, CardContent, Typography } from "@mui/material";

type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card
      variant="outlined"
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
            color: "primary.light",
            bgcolor: "rgba(37,99,235,0.14)",
            mb: 1.5,
          }}
        >
          {title.slice(0, 1)}
        </Box>
        <Typography sx={{ color: "text.primary", fontWeight: 800, mb: 0.8 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.75 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
