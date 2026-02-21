import { Play } from "lucide-react";
import type { EditorHandle } from "@/lib/rete";
import { useBacktestRunner } from "@/hooks/useBacktestRunner";
import type { BacktestResult } from "@/types";
import type { SupportedSymbol } from "shared";
import "@/styles/components/backtestRunButton.css";

type BacktestRunButtonProps = {
  symbol: SupportedSymbol;
  editorHandle: EditorHandle | null;
  onSuccess: (result: BacktestResult) => void;
  onError: (message: string) => void;
};

export function BacktestRunButton({
  symbol,
  editorHandle,
  onSuccess,
  onError,
}: BacktestRunButtonProps) {
  const { isRunning, canRun, runBacktest } = useBacktestRunner({
    symbol,
    editorHandle,
    onSuccess,
    onError,
  });
  const disabled = !canRun || isRunning;

  return (
    <button
      type="button"
      aria-label={isRunning ? "Backtesting..." : "Run Backtest"}
      title={isRunning ? "Backtesting..." : "Run Backtest"}
      onClick={runBacktest}
      onPointerDown={(event) => event.stopPropagation()}
      disabled={disabled}
      className="backtest-run-button"
    >
      <Play size={18} />
    </button>
  );
}
