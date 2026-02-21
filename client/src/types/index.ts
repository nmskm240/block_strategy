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

export type BacktestHistoryItem = {
  id: string;
  symbol: string;
  ranAt: string;
  since: string;
  until: string;
  result: BacktestResult;
};

export type BacktestRunSuccessPayload = {
  result: BacktestResult;
  symbol: string;
  since: Date;
  until: Date;
};
