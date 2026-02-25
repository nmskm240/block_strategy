import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import {
  BooleanLogicOperatorSchema,
  IndicatorKind,
  IndicatorRegistry,
  LogicalOperatorSchema,
  MathOperatorSchema,
} from "shared";
import {
  ActionNode,
  IndicatorNode,
  LogicGateNode,
  LogicalNode,
  MathNode,
  OHLCVNode,
} from "./nodes";
import { Schemes } from "./types";

export const contextMenu = new ContextMenuPlugin<Schemes>({
  items: ContextMenuPresets.classic.setup([
    ["OHLCV", () => new OHLCVNode()],
    [
      "Indicators",
      Object.keys(IndicatorRegistry).map((kind) => [
        kind,
        () => new IndicatorNode(kind as IndicatorKind),
      ]),
    ],
    ["Action", () => new ActionNode()],
    [
      "Math",
      Object.values(MathOperatorSchema.enum).map((operator) => [
        operator,
        () => new MathNode(operator),
      ]),
    ],
    [
      "Logical",
      Object.values(LogicalOperatorSchema.enum).map((operator) => [
        operator,
        () => new LogicalNode(operator),
      ]),
    ],
    [
      "Boolean Logic",
      Object.values(BooleanLogicOperatorSchema.enum).map((operator) => [
        operator,
        () => new LogicGateNode(operator),
      ]),
    ],
  ]),
});
