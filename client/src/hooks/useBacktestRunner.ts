import { BacktestApiClient } from "@/services/backtestClient";
import { useRef } from "react";
import type { BacktestEnvironment, BacktestResult, Graph } from "shared";

type BacktestRunner = {
  isRunning: boolean;
  run: (
    graph: Graph,
    environment: BacktestEnvironment,
  ) => Promise<BacktestResult>;
};

export function useBacktestRunner(): BacktestRunner {
  const isRunningRef = useRef(false);
  const backtestClient = new BacktestApiClient();

  async function run(graph: Graph, environment: BacktestEnvironment) {
    if (isRunningRef.current) {
      throw new Error("Backtest is already running");
    }
    isRunningRef.current = true;
    try {
      return await backtestClient.runBacktest({
        graph,
        environment,
      });
    } finally {
      isRunningRef.current = false;
    }
  }

  return {
    isRunning: isRunningRef.current,
    run,
  };
}
