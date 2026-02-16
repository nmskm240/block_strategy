export const NodeKind = {
  OHLCV: "ohlcv",
  INDICATOR: "indicator",
  ACTION: "action",
  LOGICAL: "logical",
} as const;

export type NodeKind = (typeof NodeKind)[keyof typeof NodeKind];
