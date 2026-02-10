import type { ClassicPreset } from "rete";

type NodeType = ClassicPreset.Node;
type ConnectionType = ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>;

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

export type GraphSnapshot = {
  nodes: NodeType[];
  connections: ConnectionType[];
};
