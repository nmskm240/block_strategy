import { Chip, Stack, Typography } from "@mui/material";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  body: string;
};

export function SectionHeading({
  eyebrow,
  title,
  body,
}: SectionHeadingProps) {
  return (
    <Stack spacing={1.5} sx={{ mb: 5, maxWidth: 760 }}>
      {eyebrow ? (
        <Chip
          label={eyebrow}
          sx={{
            width: "fit-content",
            bgcolor: "rgba(37,99,235,0.14)",
            color: "primary.light",
            fontWeight: 700,
            borderRadius: 999,
          }}
        />
      ) : null}
      <Typography
        variant="h3"
        sx={{
          color: "text.primary",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontSize: { xs: "2rem", md: "2.6rem" },
          lineHeight: 1.1,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: { xs: 15, md: 17 },
          lineHeight: 1.75,
        }}
      >
        {body}
      </Typography>
    </Stack>
  );
}
