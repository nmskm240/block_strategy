import { BacktestApiClient } from "@/services/backtestClient";
import { useMemo, useState } from "react";
import type { BacktestEnvironment, BacktestResult, Graph } from "shared";

type BacktestRunner = {
  isRunning: boolean;
  run: (
    graph: Graph,
    environment: BacktestEnvironment,
  ) => Promise<BacktestResult>;
};

export function useBacktestRunner(): BacktestRunner {
  const [isRunning, setIsRunning] = useState(false);
  const backtestClient = useMemo(() => new BacktestApiClient(), []);

  async function run(graph: Graph, environment: BacktestEnvironment) {
    if (isRunning) {
      throw new Error("Backtest is already running");
    }
    setIsRunning(true);
    try {
      return await backtestClient.runBacktest({
        graph,
        environment,
      });
    } finally {
      setIsRunning(false);
    }
  }

  return {
    isRunning,
    run,
  };
}
