import { type ReactNode } from "react";
import { AppBar, Box, Button, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useLocation } from "react-router-dom";

type Props = {
  rightContent?: ReactNode;
};

export function Header({ rightContent }: Props) {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={(theme) => ({
        bgcolor: alpha(theme.palette.background.default, 0.82),
        color: theme.palette.text.primary,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: { xs: 1.5, md: 2.5 }, py: 0.75 }}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <Box
            component="img"
            src="/logo.svg"
            alt="Algraph logo"
            sx={{ width: 120, height: "auto", margin: 1 }}
          />
        </Box>
        <Stack direction="row" spacing={1}>
          {rightContent}
          {isLanding ? (
            <Button
              component={RouterLink}
              to="/builder"
              variant="contained"
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              戦略作成を始める
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </AppBar>
  );
}
