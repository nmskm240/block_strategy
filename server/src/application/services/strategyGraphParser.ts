import {
  type StrategyGraphNode,
  StrategyGraphNodeId,
  OHLCVNode,
  IndicatorNode,
  ActionNode,
  LogicalNode,
  BooleanLogicNode,
  type StrategyGraphNodeEdge,
  StrategyGraph,
  StrategyGraphBuilder,
} from "@server/domain/strategyGraph";
import {
  type GraphNode,
  NodeKind,
  type GraphEdge,
  type Graph,
} from "@shared/types";
import { match } from "ts-pattern";

function resolveNode(nodeData: GraphNode): StrategyGraphNode {
  const nodeId = StrategyGraphNodeId(nodeData.id);

  return match(nodeData.spec)
    .with({ kind: NodeKind.OHLCV }, (spec) => new OHLCVNode(nodeId, spec))
    .with(
      { kind: NodeKind.INDICATOR },
      (spec) => new IndicatorNode(nodeId, spec),
    )
    .with({ kind: NodeKind.ACTION }, (spec) => new ActionNode(nodeId, spec))
    .with({ kind: NodeKind.LOGICAL }, (spec) => new LogicalNode(nodeId, spec))
    .with(
      { kind: NodeKind.BOOLEAN_LOGIC },
      (spec) => new BooleanLogicNode(nodeId, spec),
    )
    .exhaustive();
}

function resolveEdge(edgeData: GraphEdge): StrategyGraphNodeEdge {
  return {
    from: {
      nodeId: StrategyGraphNodeId(edgeData.from.nodeId),
      portName: edgeData.from.portName,
    },
    to: {
      nodeId: StrategyGraphNodeId(edgeData.to.nodeId),
      portName: edgeData.to.portName,
    },
  };
}

export function resolveStrategyGraph(graphData: Graph): StrategyGraph {
  let builder = new StrategyGraphBuilder();
  for (const nodeData of graphData.nodes) {
    const node = resolveNode(nodeData);
    builder = builder.addNode(node);
  }
  for (const edgeData of graphData.edges) {
    builder = builder.connect(resolveEdge(edgeData));
  }
  return builder.build();
}
