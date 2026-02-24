import { DateRangePicker } from "@/components/DateRangePicker";
import { useBacktestRunDialogViewModel } from "@/features/runBacktest/hooks/useBacktestRunDialogViewModel";
import type { EditorHandle } from "@/lib/rete";
import {
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
import { type PointerEvent } from "react";
import { BacktestResult, SUPPORTED_SYMBOLS, Timeframe } from "shared";

type Props = {
  open: boolean;
  editorHandle: EditorHandle;
  onClose: () => void;
  onRunSuccess: (item: BacktestResult) => void;
  onRunError: (message: string) => void;
};

export function BacktestRunDialog({
  open,
  editorHandle,
  onClose,
  onRunSuccess,
  onRunError,
}: Props) {
  const viewModel = useBacktestRunDialogViewModel({
    editorHandle,
    onRunSuccess,
    onRunError,
  });

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
            bgcolor: "#111724",
            color: "#e7edf8",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: 1.5,
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
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
          <InputLabel
            id="backtest-symbol-label"
            sx={{ color: "rgba(255,255,255,0.8)" }}
          >
            銘柄
          </InputLabel>
          <Select
            labelId="backtest-symbol-label"
            id="backtest-symbol"
            label="銘柄"
            value={viewModel.symbol}
            onChange={(event) => viewModel.setSymbol(event.target.value)}
            disabled={viewModel.isRunning}
            MenuProps={{
              PaperProps: {
                sx: { bgcolor: "#101722", color: "#f5f7fb" },
              },
            }}
            sx={{
              color: "#f5f7fb",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.18)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.28)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#90caf9",
              },
              ".MuiSvgIcon-root": { color: "#f5f7fb" },
            }}
          >
            {SUPPORTED_SYMBOLS.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel
            id="backtest-timeframe-label"
            sx={{ color: "rgba(255,255,255,0.8)" }}
          >
            タイムフレーム
          </InputLabel>
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
                sx: { bgcolor: "#101722", color: "#f5f7fb" },
              },
            }}
            sx={{
              color: "#f5f7fb",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.18)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.28)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#90caf9",
              },
              ".MuiSvgIcon-root": { color: "#f5f7fb" },
            }}
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
            <Box sx={{ mt: 0.75, fontSize: 12, color: "#ff8a80" }}>
              {viewModel.rangeError}
            </Box>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0.5, gap: 1 }}>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
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
          onClick={viewModel.onRunBacktest}
          disabled={!viewModel.canRunBacktest}
          sx={{
            bgcolor: "#3a4aa8",
            border: "1px solid #2c387f",
            "&:hover": { bgcolor: "#4658bf" },
            "&.Mui-disabled": {
              bgcolor: "rgba(58, 74, 168, 0.4)",
              color: "rgba(255,255,255,0.45)",
              borderColor: "rgba(44,56,127,0.4)",
            },
          }}
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
