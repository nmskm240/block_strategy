import { type Graph } from "@shared/types";
import type { BacktestEnvironment, BacktestResult } from "shared";
import { BacktestService } from "./services/backtestService";
import { resolveStrategyGraph } from "./services/strategyGraphParser";

export async function runBacktest(
  graphData: Graph,
  environment: BacktestEnvironment,
  service: BacktestService,
): Promise<BacktestResult> {
  const graph = resolveStrategyGraph(graphData);
  return await service.run(graph, environment);
}
