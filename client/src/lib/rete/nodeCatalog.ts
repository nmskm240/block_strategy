import {
  BooleanLogicOperatorSchema,
  IndicatorRegistry,
  LogicalOperatorSchema,
  MathOperatorSchema,
} from "shared";
import {
  createNodeFromCatalogItem,
  type NodeCatalogItemId,
} from "./nodeFactory";

export { createNodeFromCatalogItem };

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

const mathItems: NodeCatalogItem[] = Object.values(MathOperatorSchema.enum).map(
  (operator) => ({
    id: `math:${operator}`,
    label: operator,
    group: "math",
  }),
);

const logicalItems: NodeCatalogItem[] = Object.values(
  LogicalOperatorSchema.enum,
).map((operator) => ({
  id: `logical:${operator}`,
  label: operator,
  group: "logical",
}));

const booleanLogicItems: NodeCatalogItem[] = Object.values(
  BooleanLogicOperatorSchema.enum,
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
