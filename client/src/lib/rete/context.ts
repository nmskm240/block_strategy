import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import {
  BooleanLogicOperatorSchema,
  IndicatorRegistry,
  LogicalOperatorSchema,
  MathOperatorSchema,
} from "shared";
import { createNodeFromCatalogItem } from "./nodeFactory";
import { Schemes } from "./types";

export const contextMenu = new ContextMenuPlugin<Schemes>({
  items: ContextMenuPresets.classic.setup([
    ["OHLCV", () => createNodeFromCatalogItem("ohlcv")],
    [
      "Indicators",
      Object.keys(IndicatorRegistry).map((kind) => [
        kind,
        () => createNodeFromCatalogItem(`indicator:${kind}`),
      ]),
    ],
    ["Action", () => createNodeFromCatalogItem("action")],
    [
      "Math",
      Object.values(MathOperatorSchema.enum).map((operator) => [
        operator,
        () => createNodeFromCatalogItem(`math:${operator}`),
      ]),
    ],
    [
      "Logical",
      Object.values(LogicalOperatorSchema.enum).map((operator) => [
        operator,
        () => createNodeFromCatalogItem(`logical:${operator}`),
      ]),
    ],
    [
      "Boolean Logic",
      Object.values(BooleanLogicOperatorSchema.enum).map((operator) => [
        operator,
        () => createNodeFromCatalogItem(`boolean-logic:${operator}`),
      ]),
    ],
  ]),
});
