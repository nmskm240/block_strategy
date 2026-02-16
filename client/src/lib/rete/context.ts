import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import { IndicatorKind, IndicatorRegistry } from "shared";
import { ActionNode, IndicatorNode, LogicalNode, OHLCVNode } from "./nodes";
import { ConditionOperators, Schemes } from "./types";

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
      "Logical",
      Object.values(ConditionOperators).map((e) => [
        e.toString(),
        () => new LogicalNode(e),
      ]),
    ],
  ]),
});
