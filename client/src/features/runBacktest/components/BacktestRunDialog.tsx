import { DateRangePicker } from "@/components/DateRangePicker";
import { useBacktestRunDialogViewModel } from "@/features/runBacktest/hooks/useBacktestRunDialogViewModel";
import type { EditorHandle } from "@/lib/rete";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useEffect, useState, type PointerEvent } from "react";
import { BacktestResult, SUPPORTED_SYMBOLS, Timeframe } from "shared";

type Props = {
  open: boolean;
  editorHandle: EditorHandle;
  onClose: () => void;
  onRunSuccess: (item: BacktestResult) => void;
  onRunError: (message: string) => void;
};

const BACKTEST_RUN_ERROR_MESSAGE =
  "バックテストに失敗しました。時間を置いて再度実行してください。";

const dialogSelectSx: SxProps<Theme> = {
  color: "text.primary",
};

const dialogMenuPaperSx: SxProps<Theme> = (theme) => ({
  bgcolor: theme.palette.custom.surface.subtle,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.custom.border.subtle}`,
});

export function BacktestRunDialog({
  open,
  editorHandle,
  onClose,
  onRunSuccess,
  onRunError,
}: Props) {
  const [runErrorMessage, setRunErrorMessage] = useState<string | null>(null);
  const viewModel = useBacktestRunDialogViewModel({
    editorHandle,
    onRunSuccess,
    onRunError: (message) => {
      setRunErrorMessage(BACKTEST_RUN_ERROR_MESSAGE);
      onRunError(message);
    },
  });

  useEffect(() => {
    if (open) {
      setRunErrorMessage(null);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={viewModel.isRunning ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown={viewModel.isRunning}
      slotProps={{
        paper: {
          onPointerDown: (event: PointerEvent) => event.stopPropagation(),
          sx: {
            position: "relative",
          },
        },
        backdrop: {
          sx: { bgcolor: "rgba(0, 0, 0, 0.55)" },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontSize: 16, fontWeight: 700 }}>
        バックテスト設定
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 1.25, pt: "8px !important" }}>
        <FormControl fullWidth size="small">
          <InputLabel id="backtest-symbol-label">銘柄</InputLabel>
          <Select
            labelId="backtest-symbol-label"
            id="backtest-symbol"
            label="銘柄"
            value={viewModel.symbol}
            onChange={(event) => viewModel.setSymbol(event.target.value)}
            disabled={viewModel.isRunning}
            MenuProps={{
              PaperProps: {
                sx: dialogMenuPaperSx,
              },
            }}
            sx={dialogSelectSx}
          >
            {SUPPORTED_SYMBOLS.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="backtest-timeframe-label">タイムフレーム</InputLabel>
          <Select
            labelId="backtest-timeframe-label"
            id="backtest-timeframe"
            label="足種"
            value={viewModel.timeframe}
            onChange={(event) =>
              viewModel.setTimeframe(event.target.value as Timeframe)
            }
            disabled={viewModel.isRunning}
            MenuProps={{
              PaperProps: {
                sx: dialogMenuPaperSx,
              },
            }}
            sx={dialogSelectSx}
          >
            {Timeframe.options
              .filter((item) => item !== "1min" && item !== "5min")
              .map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Box>
          <Box
            component="div"
            sx={{ display: "block", mb: 0.75, fontSize: 12, opacity: 0.85 }}
          >
            バックテスト期間
          </Box>
          <DateRangePicker
            value={viewModel.range}
            timeframe={viewModel.timeframe}
            onChange={viewModel.setRange}
          />
          {viewModel.rangeError ? (
            <Box sx={{ mt: 0.75, fontSize: 12, color: "error.light" }}>
              {viewModel.rangeError}
            </Box>
          ) : null}
        </Box>
        {runErrorMessage ? (
          <Alert severity="error" variant="outlined">
            {runErrorMessage}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0.5, gap: 1 }}>
        <Button
          type="button"
          variant="outlined"
          onClick={() => {
            setRunErrorMessage(null);
            onClose();
          }}
          disabled={viewModel.isRunning}
          sx={{
            color: "#fff",
            borderColor: "rgba(255, 255, 255, 0.2)",
            bgcolor: "#2a3244",
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.28)",
              bgcolor: "#323b51",
            },
          }}
        >
          キャンセル
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={() => {
            setRunErrorMessage(null);
            void viewModel.onRunBacktest();
          }}
          disabled={!viewModel.canRunBacktest}
          sx={(theme) => ({
            bgcolor: theme.palette.custom.action.primaryButtonBg,
            border: `1px solid ${theme.palette.custom.action.primaryButtonBorder}`,
            "&:hover": { bgcolor: theme.palette.custom.action.primaryButtonHoverBg },
            "&.Mui-disabled": {
              bgcolor: "rgba(58, 74, 168, 0.4)",
              color: "rgba(255,255,255,0.45)",
              borderColor: "rgba(44,56,127,0.4)",
            },
          })}
        >
          {viewModel.isRunning ? (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} sx={{ color: "inherit" }} />
              実行中...
            </Box>
          ) : (
            "実行"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
