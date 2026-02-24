import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";

type FaqItemProps = {
  question: string;
  answer: string;
};

export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        bgcolor: "transparent",
        borderTop: "1px solid",
        borderColor: "divider",
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary>
        <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.8 }}>
          {answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
