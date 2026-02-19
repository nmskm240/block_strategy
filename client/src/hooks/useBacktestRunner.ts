import { useMemo, useState } from "react";
import type { EditorHandle } from "@/lib/rete";
import { BacktestApiClient } from "@/services/backtestClient";
import type { BacktestResult } from "@/types";

type UseBacktestRunnerArgs = {
  symbol: string;
  editorHandle: EditorHandle | null;
  onSuccess: (result: BacktestResult) => void;
  onError: (message: string) => void;
};

export function useBacktestRunner({
  symbol,
  editorHandle,
  onSuccess,
  onError,
}: UseBacktestRunnerArgs) {
  const [isRunning, setIsRunning] = useState(false);
  const backtestClient = useMemo(() => new BacktestApiClient(), []);

  async function runBacktest() {
    if (!editorHandle || isRunning) return;

    setIsRunning(true);
    const graph = editorHandle.getGraph();
    const until = new Date();
    const since = new Date(until.getTime() - 60 * 60 * 1000 * 60);

    try {
      const result = await backtestClient.runBacktest({
        graph,
        environment: {
          symbol,
          timeframe: "1h",
          testRange: { since, until },
          cash: 10000,
        },
      });
      onSuccess(result);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to run backtest";
      onError(message);
    } finally {
      setIsRunning(false);
    }
  }

  return {
    isRunning,
    canRun: Boolean(editorHandle),
    runBacktest,
  };
}
