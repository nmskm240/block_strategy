import { IndicatorKind, IndicatorRegistry } from "shared";
import {
  ActionNode,
  IndicatorNode,
  LogicGateNode,
  LogicalNode,
  MathNode,
  NodeBase,
  OHLCVNode,
} from "./nodes";
import {
  ConditionOperators,
  LogicGateOperators,
  MathOperators,
} from "./types";

export type NodeCatalogItemId = string;

export type NodeCatalogItem = {
  id: NodeCatalogItemId;
  label: string;
  group: string;
};

export type NodeCatalogGroup = {
  key: string;
  label: string;
  items: NodeCatalogItem[];
};

const indicatorItems: NodeCatalogItem[] = Object.keys(IndicatorRegistry).map(
  (kind) => ({
    id: `indicator:${kind}`,
    label: kind,
    group: "indicators",
  }),
);

const mathItems: NodeCatalogItem[] = Object.values(MathOperators).map(
  (operator) => ({
    id: `math:${operator}`,
    label: operator,
    group: "math",
  }),
);

const logicalItems: NodeCatalogItem[] = Object.values(ConditionOperators).map(
  (operator) => ({
    id: `logical:${operator}`,
    label: operator,
    group: "logical",
  }),
);

const booleanLogicItems: NodeCatalogItem[] = Object.values(
  LogicGateOperators,
).map((operator) => ({
  id: `boolean-logic:${operator}`,
  label: operator,
  group: "boolean-logic",
}));

export const nodeCatalogGroups: NodeCatalogGroup[] = [
  {
    key: "core",
    label: "Core",
    items: [
      { id: "ohlcv", label: "OHLCV", group: "core" },
      { id: "action", label: "Action", group: "core" },
    ],
  },
  {
    key: "indicators",
    label: "Indicators",
    items: indicatorItems,
  },
  {
    key: "math",
    label: "Math",
    items: mathItems,
  },
  {
    key: "logical",
    label: "Logical",
    items: logicalItems,
  },
  {
    key: "boolean-logic",
    label: "Boolean Logic",
    items: booleanLogicItems,
  },
];

export function createNodeFromCatalogItem(id: NodeCatalogItemId): NodeBase {
  if (id === "ohlcv") return new OHLCVNode();
  if (id === "action") return new ActionNode();

  if (id.startsWith("indicator:")) {
    const kind = id.slice("indicator:".length) as IndicatorKind;
    return new IndicatorNode(kind);
  }

  if (id.startsWith("math:")) {
    const operator = id.slice("math:".length) as MathOperators;
    return new MathNode(operator);
  }

  if (id.startsWith("logical:")) {
    const operator = id.slice("logical:".length) as ConditionOperators;
    return new LogicalNode(operator);
  }

  if (id.startsWith("boolean-logic:")) {
    const operator = id.slice("boolean-logic:".length) as LogicGateOperators;
    return new LogicGateNode(operator);
  }

  throw new Error(`Unknown node catalog item: ${id}`);
}

