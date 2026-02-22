import { createRoot } from "react-dom/client";
import { ClassicPreset, NodeEditor } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { Presets, ReactPlugin } from "rete-react-plugin";
import type { Graph } from "shared";
import "./styles/area.css";
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
import { ThemedNodeComponent } from "./customization";
import {
  ActionNode,
  IndicatorNode,
  LogicGateNode,
  MathNode,
  NodeBase,
  LogicalNode,
  OHLCVNode,
} from "./nodes";
import { ConditionOperators } from "./types";
import type { AreaExtra, Schemes } from "./types";

export type EditorHandle = {
  destroy: () => void;
  getGraph: () => Graph;
};

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

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(
    Presets.classic.setup({
      customize: {
        node() {
          return ThemedNodeComponent;
        },
        // socket() {
        //   return ThemedSocketComponent;
        // },
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

  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(contextMenu);

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
  await setupDefaultStrategy(editor, area);

  const handle: EditorHandle = {
    destroy: () => {
      container.removeEventListener("dblclick", blockDoubleClickZoom, true);
      container.classList.remove("rete-editor-area");
      area.destroy();
    },
    getGraph: () => {
      const nodes = editor
        .getNodes()
        .map((node) => node.toGraphNode())
        .filter((node): node is NonNullable<typeof node> => node !== null);

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
  };

  return handle;
}

async function setupDefaultStrategy(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
) {
  if (editor.getNodes().length > 0) {
    return;
  }

  const close = new OHLCVNode();
  const sma20 = new IndicatorNode("sma");
  const sma50 = new IndicatorNode("sma");
  const goldenCross = new LogicalNode(ConditionOperators.GREATER_THAN);
  const deadCross = new LogicalNode(ConditionOperators.LESS_THAN);
  const longEntry = new ActionNode();
  const shortEntry = new ActionNode();

  (close.controls.kind as SelectControl).setValue("CLOSE");
  (sma20.controls.period as LabeledInputControl<"number">).setValue(20);
  (sma50.controls.period as LabeledInputControl<"number">).setValue(50);

  await editor.addNode(close);
  await editor.addNode(sma20);
  await editor.addNode(sma50);
  await editor.addNode(goldenCross);
  (shortEntry.controls.side as SelectControl).setValue("SELL");

  await editor.addNode(longEntry);
  await editor.addNode(deadCross);
  await editor.addNode(shortEntry);

  await area.translate(close.id, { x: 80, y: 180 });
  await area.translate(sma20.id, { x: 300, y: 90 });
  await area.translate(sma50.id, { x: 300, y: 280 });
  await area.translate(goldenCross.id, { x: 560, y: 120 });
  await area.translate(longEntry.id, { x: 800, y: 120 });
  await area.translate(deadCross.id, { x: 560, y: 300 });
  await area.translate(shortEntry.id, { x: 800, y: 300 });

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

  await AreaExtensions.zoomAt(
    area,
    [close, sma20, sma50, goldenCross, longEntry, deadCross, shortEntry],
    { scale: 0.9 },
  );
}
