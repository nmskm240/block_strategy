export type Trade = {
  side: "BUY" | "SELL";
  price: number;
  size: number;
  time: string;
};

export type BacktestResult = {
  trades: Trade[];
  startCash: number;
  finalCash: number;
  finalPosition: number;
  finalEquity: number;
  pnl: number;
  lastPrice: number;
};

export type GraphNodePayload = {
  id: string;
  label: string;
  controls: Record<string, string | number | boolean | null>;
};

export type GraphConnectionPayload = {
  id: string;
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
};

export type GraphPayload = {
  nodes: GraphNodePayload[];
  connections: GraphConnectionPayload[];
};
