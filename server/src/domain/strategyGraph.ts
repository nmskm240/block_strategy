import {
  ActionNodeSpecSchema,
  BooleanLogicNodeSpecSchema,
  IndicatorNodeSpecSchema,
  LogicalNodeSpecSchema,
  OhlcvNodeSpecSchema,
  type ActionNodeSpec,
  type BooleanLogicNodeSpec,
  type IndicatorNodeSpec,
  type LogicalNodeSpec,
  type NodeSpec,
  type OhlcvNodeSpec,
  type GraphPort,
} from "@shared/types";

const strategyGraphNodeIdBrand = Symbol("StrategyGraphNodeId");

export type StrategyGraphNodeId = string & {
  [strategyGraphNodeIdBrand]: unknown;
};

export const StrategyGraphNodeId = (id: string): StrategyGraphNodeId =>
  id as StrategyGraphNodeId;

export type StrategyGraphNodePortRef = {
  nodeId: StrategyGraphNodeId;
  portName: string;
};

export function StrategyGraphNodePortKey(
  ref: StrategyGraphNodePortRef,
): string {
  return `${ref.nodeId}:${ref.portName}`;
}

export type StrategyGraphNodeEdge = {
  from: StrategyGraphNodePortRef;
  to: StrategyGraphNodePortRef;
};

export interface StrategyGraphNode {
  readonly id: StrategyGraphNodeId;
  readonly spec: NodeSpec;
  readonly inputPorts: readonly GraphPort[];
  readonly outputPorts: readonly GraphPort[];
}

export class OHLCVNode implements StrategyGraphNode {
  readonly id: StrategyGraphNodeId;
  readonly spec: OhlcvNodeSpec;
  readonly inputPorts: readonly GraphPort[] = [];
  readonly outputPorts: readonly GraphPort[] = [
    { name: "value", type: "NUMERIC" },
  ];

  constructor(id: StrategyGraphNodeId, spec: OhlcvNodeSpec) {
    const parsed = OhlcvNodeSpecSchema.safeParse(spec);
    if (!parsed.success) {
      throw new Error(`Invalid OHLCV node spec: ${parsed.error.message}`);
    }

    this.id = id;
    this.spec = parsed.data;
  }
}

export class IndicatorNode implements StrategyGraphNode {
  readonly id: StrategyGraphNodeId;
  readonly spec: IndicatorNodeSpec;
  readonly inputPorts: readonly GraphPort[];
  readonly outputPorts: readonly GraphPort[];

  constructor(id: StrategyGraphNodeId, spec: IndicatorNodeSpec) {
    const parsed = IndicatorNodeSpecSchema.safeParse(spec);
    if (!parsed.success) {
      throw new Error(`Invalid indicator node spec: ${parsed.error.message}`);
    }

    this.id = id;
    this.spec = parsed.data;
    this.inputPorts = Object.entries(parsed.data.inputs).map(([name, _]) => ({
      name,
      type: "NUMERIC",
    }));
    this.outputPorts = Object.entries(parsed.data.outputs).map(([name, _]) => ({
      name,
      type: "NUMERIC",
    }));
  }
}

export class ActionNode implements StrategyGraphNode {
  readonly id: StrategyGraphNodeId;
  readonly spec: ActionNodeSpec;
  readonly inputPorts: readonly GraphPort[] = [
    { name: "trigger", type: "BOOLEAN" },
  ];
  readonly outputPorts: readonly GraphPort[] = [];

  constructor(id: StrategyGraphNodeId, spec: ActionNodeSpec) {
    const parsed = ActionNodeSpecSchema.safeParse(spec);
    if (!parsed.success) {
      throw new Error(`Invalid action node spec: ${parsed.error.message}`);
    }

    this.id = id;
    this.spec = parsed.data;
  }
}

export class LogicalNode implements StrategyGraphNode {
  readonly id: StrategyGraphNodeId;
  readonly spec: LogicalNodeSpec;
  readonly inputPorts: readonly GraphPort[] = [
    { name: "left", type: "NUMERIC" },
    { name: "right", type: "NUMERIC" },
  ];
  readonly outputPorts: readonly GraphPort[] = [
    { name: "true", type: "BOOLEAN" },
  ];

  constructor(id: StrategyGraphNodeId, spec: LogicalNodeSpec) {
    const parsed = LogicalNodeSpecSchema.safeParse(spec);
    if (!parsed.success) {
      throw new Error(`Invalid logical node spec: ${parsed.error.message}`);
    }

    this.id = id;
    this.spec = parsed.data;
  }
}

export class BooleanLogicNode implements StrategyGraphNode {
  readonly id: StrategyGraphNodeId;
  readonly spec: BooleanLogicNodeSpec;
  readonly inputPorts: readonly GraphPort[];
  readonly outputPorts: readonly GraphPort[] = [
    { name: "true", type: "BOOLEAN" },
  ];

  constructor(id: StrategyGraphNodeId, spec: BooleanLogicNodeSpec) {
    const parsed = BooleanLogicNodeSpecSchema.safeParse(spec);
    if (!parsed.success) {
      throw new Error(
        `Invalid boolean logic node spec: ${parsed.error.message}`,
      );
    }

    this.id = id;
    this.spec = parsed.data;
    this.inputPorts = Object.keys(parsed.data.inputs).map((name) => ({
      name,
      type: "BOOLEAN",
    }));
  }
}

export class StrategyGraph {
  readonly nodes: ReadonlyMap<StrategyGraphNodeId, StrategyGraphNode>;
  readonly edges: StrategyGraphNodeEdge[];

  constructor(
    nodes: Iterable<StrategyGraphNode>,
    edges: StrategyGraphNodeEdge[],
  ) {
    this.nodes = new Map(Array.from(nodes).map((n) => [n.id, n]));
    this.edges = edges;

    this._ensureUniqueNodeIds();
    this._ensureValidEdges();
  }

  private _ensureUniqueNodeIds() {
    const nodeIds = new Set<StrategyGraphNodeId>();
    for (const node of this.nodes.values()) {
      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node ID found: ${node.id}`);
      }
      nodeIds.add(node.id);
    }
  }

  private _ensureValidEdges() {
    for (const edge of this.edges) {
      if (!this.nodes.has(edge.from.nodeId)) {
        throw new Error(
          `Edge references non-existent source node ID: ${edge.from.nodeId}`,
        );
      }
      if (!this.nodes.has(edge.to.nodeId)) {
        throw new Error(
          `Edge references non-existent target node ID: ${edge.to.nodeId}`,
        );
      }
    }
  }
}

export function extractSubgraph(
  graph: StrategyGraph,
  actionNode: ActionNode,
): StrategyGraph {
  if (!graph.nodes.has(actionNode.id)) {
    throw new Error(`Action node '${actionNode.id}' does not exist in graph`);
  }

  const visited = new Set<StrategyGraphNodeId>();
  const selectedEdges: StrategyGraphNodeEdge[] = [];
  const stack: StrategyGraphNodeId[] = [actionNode.id];

  while (stack.length > 0) {
    const nodeId = stack.pop() as StrategyGraphNodeId;
    if (visited.has(nodeId)) {
      continue;
    }
    visited.add(nodeId);

    for (const edge of graph.edges) {
      if (edge.to.nodeId !== nodeId) {
        continue;
      }
      selectedEdges.push(edge);
      if (!visited.has(edge.from.nodeId)) {
        stack.push(edge.from.nodeId);
      }
    }
  }

  const nodes = Array.from(visited).map((id) => {
    const node = graph.nodes.get(id);
    if (!node) {
      throw new Error(`Subgraph references missing node '${id}'`);
    }
    return node;
  });

  const edges = selectedEdges.filter(
    (edge) => visited.has(edge.from.nodeId) && visited.has(edge.to.nodeId),
  );

  return new StrategyGraph(nodes, edges);
}

export function topologicalSort(
  nodes: readonly StrategyGraphNode[],
  edges: readonly StrategyGraphNodeEdge[],
): StrategyGraphNode[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const indegree = new Map<StrategyGraphNodeId, number>(
    nodes.map((node) => [node.id, 0]),
  );
  const outgoing = new Map<StrategyGraphNodeId, StrategyGraphNodeId[]>();

  for (const edge of edges) {
    if (!nodeMap.has(edge.from.nodeId) || !nodeMap.has(edge.to.nodeId)) {
      continue;
    }
    indegree.set(edge.to.nodeId, (indegree.get(edge.to.nodeId) ?? 0) + 1);
    const current = outgoing.get(edge.from.nodeId) ?? [];
    current.push(edge.to.nodeId);
    outgoing.set(edge.from.nodeId, current);
  }

  const queue = Array.from(indegree.entries())
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId);
  const sorted: StrategyGraphNode[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift() as StrategyGraphNodeId;
    const node = nodeMap.get(nodeId);
    if (!node) {
      continue;
    }
    sorted.push(node);

    const targets = outgoing.get(nodeId) ?? [];
    for (const targetId of targets) {
      const nextDegree = (indegree.get(targetId) ?? 0) - 1;
      indegree.set(targetId, nextDegree);
      if (nextDegree === 0) {
        queue.push(targetId);
      }
    }
  }

  if (sorted.length !== nodes.length) {
    throw new Error("Cycle detected while topologically sorting StrategyGraph");
  }

  return sorted;
}

export class StrategyGraphBuilder {
  private nodes: Map<StrategyGraphNodeId, StrategyGraphNode> = new Map();
  private edges: StrategyGraphNodeEdge[] = [];

  addNode(node: StrategyGraphNode): this {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with ID ${node.id} already exists in the graph.`);
    }
    this.nodes.set(node.id, node);
    return this;
  }

  connect(edge: StrategyGraphNodeEdge): this {
    this.edges.push(edge);
    return this;
  }

  build(): StrategyGraph {
    return new StrategyGraph(this.nodes.values(), this.edges);
  }
}
