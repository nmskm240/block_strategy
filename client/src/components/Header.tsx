import { AppBar, Box } from "@mui/material";

export function Header() {
  return (
    <AppBar position="static">
      <Box
        component="img"
        src="/logo.png"
        alt="Algraph logo"
        sx={{ width: 120, height: "auto", margin: 1, marginLeft: 2 }}
      />
    </AppBar>
  );
}
