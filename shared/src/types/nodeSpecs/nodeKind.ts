export const NodeKind = {
  OHLCV: "ohlcv",
  INDICATOR: "indicator",
  ACTION: "action",
} as const;

export type NodeKind = (typeof NodeKind)[keyof typeof NodeKind];
