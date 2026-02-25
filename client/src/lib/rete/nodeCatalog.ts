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
  NodeBase,
  OHLCVNode,
} from "./nodes";

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

export function createNodeFromCatalogItem(id: NodeCatalogItemId): NodeBase {
  if (id === "ohlcv") return new OHLCVNode();
  if (id === "action") return new ActionNode();

  if (id.startsWith("indicator:")) {
    const kind = id.slice("indicator:".length) as IndicatorKind;
    return new IndicatorNode(kind);
  }

  if (id.startsWith("math:")) {
    const operator = MathOperatorSchema.safeParse(id.slice("math:".length));
    if (!operator.success) {
      throw new Error(`Invalid math operator: ${id}`);
    }
    return new MathNode(operator.data);
  }

  if (id.startsWith("logical:")) {
    const operator = LogicalOperatorSchema.safeParse(
      id.slice("logical:".length),
    );
    if (!operator.success) {
      throw new Error(`Invalid logical operator: ${id}`);
    }
    return new LogicalNode(operator.data);
  }

  if (id.startsWith("boolean-logic:")) {
    const operator = BooleanLogicOperatorSchema.safeParse(
      id.slice("boolean-logic:".length),
    );
    if (!operator.success) {
      throw new Error(`Invalid boolean logic operator: ${id}`);
    }
    return new LogicGateNode(operator.data);
  }

  throw new Error(`Unknown node catalog item: ${id}`);
}
