import { createRoot } from "react-dom/client";
import { ClassicPreset, NodeEditor } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { Presets, ReactPlugin } from "rete-react-plugin";
import {
  AutoArrangePlugin,
  Presets as ArrangePresets,
} from "rete-auto-arrange-plugin";
import {
  Graph as StrategyGraph,
  type OhlcvKind,
  type OrderMode,
  type OrderSide,
} from "shared";
import { Connection } from "./connection";
import { contextMenu } from "./context";
import {
  LabeledInputControl,
  LabeledInputControlComponent,
  SelectControl,
  SelectControlComponent,
  StepperControl,
  StepperControlComponent,
} from "./controls";
import {
  ThemedConnectionComponent,
  ThemedNodeComponent,
} from "./customization";
import { createNodeFromCatalogItem } from "./nodeCatalog";
import { createNodeFromGraphNode, NodeCatalogItemId } from "./nodeFactory";
import {
  ActionNode,
  IndicatorNode,
  LogicalNode,
  LogicGateNode,
  MathNode,
  NodeBase,
  OHLCVNode,
} from "./nodes";
import "./styles/area.css";
import type { AreaExtra, Schemes } from "./types";

export type EditorHandle = {
  destroy: () => void;
  getGraph: () => StrategyGraph;
  parseFromJson: (json: string) => Promise<void>;
  addNodeAtViewportCenter: (itemId: NodeCatalogItemId) => Promise<void>;
};

const NODE_SIZE_READY_TIMEOUT_MS = 300;
const APPROX_NODE_HALF_SIZE = { x: 110, y: 70 } as const;

export async function createEditor(container: HTMLElement) {
  container.classList.add("rete-editor-area");
  const blockDoubleClickZoom = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  container.addEventListener("dblclick", blockDoubleClickZoom, true);
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const arrange = new AutoArrangePlugin<Schemes>();

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });
  AreaExtensions.restrictor(area, {
    scaling: {
      min: 0.5,
      max: 1.5,
    },
  });

  render.addPreset(
    Presets.classic.setup({
      customize: {
        node() {
          return ThemedNodeComponent;
        },
        connection() {
          return ThemedConnectionComponent;
        },
        control(data) {
          if (data.payload instanceof SelectControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return SelectControlComponent;
          }
          if (data.payload instanceof LabeledInputControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return LabeledInputControlComponent;
          }
          if (data.payload instanceof StepperControl) {
            return StepperControlComponent;
          }
          if (data.payload instanceof ClassicPreset.InputControl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return Presets.classic.Control as any;
          }
          return null;
        },
      },
    }),
  );
  render.addPreset(Presets.contextMenu.setup());
  arrange.addPreset(ArrangePresets.classic.setup());
  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(contextMenu);
  area.use(arrange);

  editor.addPipe((context) => {
    if (
      context.type === "nodecreated" &&
      context.data instanceof LogicGateNode
    ) {
      context.data.setOnStructureChanged((removedInputKeys) => {
        void (async () => {
          const targetConnections = editor
            .getConnections()
            .filter(
              (conn) =>
                conn.target === context.data.id &&
                removedInputKeys.includes(String(conn.targetInput)),
            );
          for (const conn of targetConnections) {
            await editor.removeConnection(conn.id);
          }
          await area.update("node", String(context.data.id));
        })();
      });
    }
    return context;
  });

  AreaExtensions.showInputControl(area, ({ input, hasAnyConnection }) => {
    const isOperandInput = editor.getNodes().some((node) => {
      if (node instanceof MathNode) {
        return node.inputs.left === input || node.inputs.right === input;
      }
      if (!(node instanceof LogicalNode)) {
        if (node instanceof LogicGateNode) {
          return node.hasInputPort(input);
        }
        return false;
      }
      return node.inputs.left === input || node.inputs.right === input;
    });

    if (isOperandInput) {
      return !hasAnyConnection;
    }
    return true;
  });

  AreaExtensions.simpleNodesOrder(area);
  // await setupDefaultStrategy(editor, area);

  const waitForPaint = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const waitForNodeSizesReady = async (
    timeoutMs = NODE_SIZE_READY_TIMEOUT_MS,
  ) => {
    const deadline = performance.now() + timeoutMs;

    while (performance.now() < deadline) {
      const allReady = editor.getNodes().every(isNodeSizeReady);

      if (allReady) {
        return;
      }

      await waitForPaint();
    }
  };

  const updateAllRenderedNodes = async () => {
    for (const node of editor.getNodes()) {
      await area.update("node", node.id);
    }
  };

  const restoreNodesFromGraph = async (graph: StrategyGraph) => {
    const restoredNodeByGraphId = new Map<string, NodeBase>();

    for (const graphNode of graph.nodes) {
      const node = createNodeFromGraphNode(graphNode);
      await editor.addNode(node);
      node.inject(graphNode.spec);
      restoredNodeByGraphId.set(graphNode.id, node);
    }

    return restoredNodeByGraphId;
  };

  const restoreConnectionsFromGraph = async (
    graph: StrategyGraph,
    nodeByGraphId: Map<string, NodeBase>,
  ) => {
    for (const edge of graph.edges) {
      const source = nodeByGraphId.get(edge.from.nodeId);
      const target = nodeByGraphId.get(edge.to.nodeId);
      if (!canRestoreConnection(source, target, edge)) continue;

      await editor.addConnection(
        new Connection(source, edge.from.portName, target!, edge.to.portName),
      );
    }
  };

  const handle: EditorHandle = {
    destroy: () => {
      container.removeEventListener("dblclick", blockDoubleClickZoom, true);
      container.classList.remove("rete-editor-area");
      area.destroy();
    },
    getGraph: () => {
      const nodes = editor.getNodes().map((node) => node.toGraphNode());
      const edges = editor.getConnections().map((connection) => ({
        from: {
          nodeId: String(connection.source),
          portName: String(connection.sourceOutput),
        },
        to: {
          nodeId: String(connection.target),
          portName: String(connection.targetInput),
        },
      }));
      return { nodes, edges };
    },
    parseFromJson: async (json) => {
      const parsed = StrategyGraph.parse(JSON.parse(json));
      const restoredNodeByGraphId = await restoreNodesFromGraph(parsed);
      await restoreConnectionsFromGraph(parsed, restoredNodeByGraphId);
      await updateAllRenderedNodes();

      await waitForNodeSizesReady();

      await arrange.layout();
    },
    addNodeAtViewportCenter: async (itemId) => {
      const node = createNodeFromCatalogItem(itemId);
      await editor.addNode(node);

      const rect = container.getBoundingClientRect();
      const transform = area.area.transform;
      const viewportCenter = {
        x: (rect.width / 2 - transform.x) / transform.k,
        y: (rect.height / 2 - transform.y) / transform.k,
      };

      // Approximate node size so placement feels centered across node types.
      await area.translate(node.id, {
        x: viewportCenter.x - APPROX_NODE_HALF_SIZE.x,
        y: viewportCenter.y - APPROX_NODE_HALF_SIZE.y,
      });
    },
  };

  return handle;
}

function isNodeSizeReady(node: NodeBase): boolean {
  return (
    Number.isFinite(node.width) &&
    Number.isFinite(node.height) &&
    (node.width ?? 0) > 0 &&
    (node.height ?? 0) > 0
  );
}

function canRestoreConnection(
  source: NodeBase | undefined,
  target: NodeBase | undefined,
  edge: StrategyGraph["edges"][number],
): source is NodeBase {
  if (!source || !target) return false;
  if (!source.outputs[edge.from.portName]) return false;
  if (!target.inputs[edge.to.portName]) return false;
  return true;
}

async function setupDefaultStrategy(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
) {
  if (editor.getNodes().length > 0) {
    return;
  }

  const close = new OHLCVNode();
  const sma20 = new IndicatorNode("SMA");
  const sma50 = new IndicatorNode("SMA");
  const goldenCross = new LogicalNode("CrossOver");
  const deadCross = new LogicalNode("CrossDown");
  const longEntry = new ActionNode();
  const longExit = new ActionNode();
  const shortEntry = new ActionNode();
  const shortExit = new ActionNode();

  (close.controls.kind as SelectControl<OhlcvKind>).setValue("CLOSE");
  (sma20.controls.period as LabeledInputControl<"number">).setValue(20);
  (sma50.controls.period as LabeledInputControl<"number">).setValue(50);
  (longExit.controls.mode as SelectControl<OrderMode>).setValue("MARKET_EXIT");
  (shortEntry.controls.side as SelectControl<OrderSide>).setValue("SELL");
  (shortExit.controls.mode as SelectControl<OrderMode>).setValue("MARKET_EXIT");

  await editor.addNode(close);
  await editor.addNode(sma20);
  await editor.addNode(sma50);
  await editor.addNode(goldenCross);
  await editor.addNode(longEntry);
  await editor.addNode(shortExit);
  await editor.addNode(deadCross);
  await editor.addNode(shortEntry);
  await editor.addNode(longExit);

  await area.translate(close.id, { x: 80, y: 180 });
  await area.translate(sma20.id, { x: 300, y: 90 });
  await area.translate(sma50.id, { x: 300, y: 280 });
  await area.translate(goldenCross.id, { x: 560, y: 120 });
  await area.translate(longEntry.id, { x: 800, y: 120 });
  await area.translate(shortExit.id, { x: 1040, y: 120 });
  await area.translate(deadCross.id, { x: 560, y: 300 });
  await area.translate(shortEntry.id, { x: 800, y: 300 });
  await area.translate(longExit.id, { x: 1040, y: 300 });

  const asSchemeConnection = <A extends NodeBase, B extends NodeBase>(
    connection: Connection<A, B>,
  ) => connection as unknown as Connection<NodeBase, NodeBase>;

  await editor.addConnection(
    asSchemeConnection(new Connection(close, "value", sma20, "source")),
  );
  await editor.addConnection(
    asSchemeConnection(new Connection(close, "value", sma50, "source")),
  );
  await editor.addConnection(
    asSchemeConnection(new Connection(sma20, "value", goldenCross, "left")),
  );
  await editor.addConnection(
    asSchemeConnection(new Connection(sma50, "value", goldenCross, "right")),
  );
  await editor.addConnection(
    asSchemeConnection(
      new Connection(goldenCross, "true", longEntry, "trigger"),
    ),
  );
  await editor.addConnection(
    asSchemeConnection(
      new Connection(goldenCross, "true", shortExit, "trigger"),
    ),
  );
  await editor.addConnection(
    asSchemeConnection(new Connection(sma20, "value", deadCross, "left")),
  );
  await editor.addConnection(
    asSchemeConnection(new Connection(sma50, "value", deadCross, "right")),
  );
  await editor.addConnection(
    asSchemeConnection(
      new Connection(deadCross, "true", shortEntry, "trigger"),
    ),
  );
  await editor.addConnection(
    asSchemeConnection(new Connection(deadCross, "true", longExit, "trigger")),
  );

  await AreaExtensions.zoomAt(
    area,
    [
      close,
      sma20,
      sma50,
      goldenCross,
      longEntry,
      shortExit,
      deadCross,
      shortEntry,
      longExit,
    ],
    { scale: 0.9 },
  );
}
