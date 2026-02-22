export const NodeKind = {
  OHLCV: "ohlcv",
  INDICATOR: "indicator",
  ACTION: "action",
  LOGICAL: "logical",
  BOOLEAN_LOGIC: "booleanLogic",
} as const;

export type NodeKind = (typeof NodeKind)[keyof typeof NodeKind];
