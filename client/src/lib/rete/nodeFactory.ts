import {
  BooleanLogicOperatorSchema,
  type GraphNode as StrategyGraphNode,
  type IndicatorKind,
  LogicalOperatorSchema,
  MathOperatorSchema,
  NodeKind,
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

export function createNodeFromGraphNode(
  graphNode: StrategyGraphNode,
): NodeBase {
  switch (graphNode.spec.kind) {
    case NodeKind.OHLCV:
      return new OHLCVNode();
    case NodeKind.ACTION:
      return new ActionNode();
    case NodeKind.INDICATOR:
      return new IndicatorNode(graphNode.spec.indicatorType as IndicatorKind);
    case NodeKind.MATH:
      return new MathNode(graphNode.spec.operator);
    case NodeKind.LOGICAL:
      return new LogicalNode(graphNode.spec.operator);
    case NodeKind.BOOLEAN_LOGIC:
      return new LogicGateNode(graphNode.spec.operator);
    default:
      throw new Error(
        `Unsupported node kind: ${String(
          (graphNode.spec as { kind?: unknown }).kind,
        )}`,
      );
  }
}
