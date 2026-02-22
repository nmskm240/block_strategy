export const NodeKind = {
  OHLCV: "ohlcv",
  INDICATOR: "indicator",
  MATH: "math",
  ACTION: "action",
  LOGICAL: "logical",
  BOOLEAN_LOGIC: "booleanLogic",
} as const;

export type NodeKind = (typeof NodeKind)[keyof typeof NodeKind];
