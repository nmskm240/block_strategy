import { AppBar, Box } from "@mui/material";

export function Header() {
  return (
    <AppBar
      position="sticky"
        >
          <Box
            component="img"
            src="/logo.svg"
            alt="Algraph logo"
            sx={{ width: 120, height: "auto" }}
          />
        </Box>
    </AppBar>
  );
}
