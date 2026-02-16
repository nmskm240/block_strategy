import type { Trade } from "shared";

export type BacktestResult = {
  trades: Trade[];
  startCash: number;
  finalCash: number;
  finalPosition: number;
  finalEquity: number;
  pnl: number;
  lastPrice: number;
};
