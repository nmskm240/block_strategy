import {
  ActionNodeSpecSchema,
  IndicatorNodeSpecSchema,
  OhlcvNodeSpecSchema,
  type ActionNodeSpec,
  type IndicatorNodeSpec,
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
  readonly spec: NodeSpec;
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
  readonly spec: NodeSpec;
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
  readonly spec: NodeSpec;
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
