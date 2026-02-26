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
  Popover,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Plus, Search } from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";

type Props = {
  editorHandle?: EditorHandle;
};

export function NodeAddFab({ editorHandle }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);
  const [nodeQuery, setNodeQuery] = useState("");
  const [desktopAnchorEl, setDesktopAnchorEl] = useState<HTMLElement | null>(
    null,
  );

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

  const openPicker = (event: MouseEvent<HTMLElement>) => {
    if (!isMobile) {
      setDesktopAnchorEl(event.currentTarget);
    }
    setIsNodePickerOpen(true);
  };

  const closePicker = () => {
    setIsNodePickerOpen(false);
    setDesktopAnchorEl(null);
  };

  const pickerBody = (
    <>
      <Box sx={{ px: 2, pt: 1.25, pb: 1 }}>
        {isMobile ? (
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
        ) : null}
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
      <List
        dense
        sx={{ flex: 1, minHeight: 0, overflowY: "auto", pt: 0 }}
        subheader={<li />}
      >
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
                      closePicker();
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
    </>
  );

  return (
    <>
      <Fab
        color="primary"
        aria-label="Add node"
        onClick={openPicker}
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

      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={isNodePickerOpen}
          onClose={closePicker}
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
          {pickerBody}
        </Drawer>
      ) : (
        <Popover
          open={isNodePickerOpen}
          anchorEl={desktopAnchorEl}
          onClose={closePicker}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: (theme) => ({
                width: 380,
                maxHeight: "70dvh",
                mb: 1,
                borderRadius: 3,
                border: `1px solid ${theme.palette.custom.border.subtle}`,
                backgroundColor: theme.palette.custom.surface.base,
                overflow: "hidden",
              }),
            },
          }}
        >
          <Box
            sx={{
              width: 380,
              maxWidth: "min(380px, 90vw)",
              maxHeight: "70dvh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {pickerBody}
          </Box>
        </Popover>
      )}
    </>
  );
}
