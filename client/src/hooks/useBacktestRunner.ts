import { useState } from "react";
import { useBacktestApiClient } from "@/contexts/apiClientContext";
import type { EditorHandle } from "@/lib/rete";
import type { BacktestRunSuccessPayload } from "@/types";
import type { SupportedSymbol } from "shared";

type UseBacktestRunnerArgs = {
  editorHandle: EditorHandle | null;
  onSuccess: (payload: BacktestRunSuccessPayload) => void;
  onError: (message: string) => void;
};

type RunBacktestParams = {
  symbol: SupportedSymbol;
  since: Date;
  until: Date;
};

export function useBacktestRunner({
  editorHandle,
  onSuccess,
  onError,
}: UseBacktestRunnerArgs) {
  const [isRunning, setIsRunning] = useState(false);
  const backtestClient = useBacktestApiClient();

  async function runBacktest({ symbol, since, until }: RunBacktestParams) {
    if (!editorHandle || isRunning) return;

    setIsRunning(true);
    const graph = editorHandle.getGraph();

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
      onSuccess({ result, symbol, since, until });
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
