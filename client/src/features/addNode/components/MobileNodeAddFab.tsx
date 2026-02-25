import { nodeCatalogGroups, type EditorHandle } from "@/lib/rete";
import {
  Box,
  Drawer,
  Fab,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  editorHandle?: EditorHandle;
};

export function MobileNodeAddFab({ editorHandle }: Props) {
  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);
  const [nodeQuery, setNodeQuery] = useState("");

  const filteredNodeGroups = useMemo(() => {
    const query = nodeQuery.trim().toLowerCase();
    if (!query) return nodeCatalogGroups;

    return nodeCatalogGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [nodeQuery]);

  return (
    <>
      <Fab
        color="primary"
        aria-label="Add node"
        onClick={() => setIsNodePickerOpen(true)}
        onPointerDown={(event) => event.stopPropagation()}
        disabled={!editorHandle}
        sx={(theme) => ({
          position: "absolute",
          right: theme.spacing(2),
          bottom: theme.spacing(11),
          zIndex: theme.zIndex.fab ?? 10,
          bgcolor: theme.palette.custom.action.addNodeFabBg,
          color: theme.palette.primary.contrastText,
          "&:hover": { bgcolor: theme.palette.custom.action.addNodeFabHoverBg },
        })}
      >
        <Plus />
      </Fab>

      <Drawer
        anchor="bottom"
        open={isNodePickerOpen}
        onClose={() => setIsNodePickerOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: (theme) => ({
            height: "70dvh",
            borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
            borderTopRightRadius: Number(theme.shape.borderRadius) * 2,
            border: `1px solid ${theme.palette.custom.border.subtle}`,
            borderBottom: 0,
            backgroundColor: theme.palette.custom.surface.base,
            overflow: "hidden",
          }),
        }}
      >
        <Box sx={{ px: 2, pt: 1.25, pb: 1 }}>
          <Box
            sx={{
              width: 42,
              height: 5,
              borderRadius: 999,
              bgcolor: "custom.border.default",
              mx: "auto",
              mb: 1.25,
            }}
          />
          <Stack spacing={1}>
            <Typography variant="h6">Add Node</Typography>
            <TextField
              size="small"
              placeholder="Search nodes"
              value={nodeQuery}
              onChange={(event) => setNodeQuery(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                      <Search size={16} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </Box>
        <List dense sx={{ overflowY: "auto", pt: 0 }} subheader={<li />}>
          {filteredNodeGroups.map((group) => (
            <li key={group.key}>
              <ul style={{ padding: 0, margin: 0 }}>
                <ListSubheader
                  sx={(theme) => ({
                    lineHeight: "32px",
                    backgroundColor: theme.palette.custom.surface.base,
                    color: theme.palette.custom.text.faint,
                  })}
                >
                  {group.label}
                </ListSubheader>
                {group.items.map((item) => (
                  <ListItemButton
                    key={item.id}
                    onClick={() => {
                      void editorHandle?.addNodeAtViewportCenter(item.id).finally(() => {
                        setIsNodePickerOpen(false);
                      });
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </ul>
            </li>
          ))}
          {filteredNodeGroups.length === 0 && (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No nodes found.
              </Typography>
            </Box>
          )}
        </List>
      </Drawer>
    </>
  );
}
