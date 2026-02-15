import { createRoot } from "react-dom/client";
import { ClassicPreset, NodeEditor } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets } from "rete-react-plugin";
import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import { SelectControl, SelectControlComponent } from "./controls";
import {
  ConditionNode,
  IndicatorNode,
  INDICATOR_NODE_PORTS_CHANGED_EVENT,
  OHLCVNode,
  OrderNode,
} from "./nodes";
import { AreaExtra, Schemes } from "./types";
import type { GraphPayload } from "@/types";

export type EditorHandle = {
  destroy: () => void;
  getGraphPayload: () => GraphPayload;
};

function toSerializableControlValue(value: unknown): string | number | boolean | null {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (value === null) return null;
  return null;
}

export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ["OHLCV", () => new OHLCVNode()],
      ["Indicator", () => new IndicatorNode()],
      ["Order", () => new OrderNode()],
      ["Condition", () => new ConditionNode()],
    ]),
  });

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(
    Presets.classic.setup({
      customize: {
        control(data) {
          if (data.payload instanceof SelectControl) {
            return SelectControlComponent;
          }
          if (data.payload instanceof ClassicPreset.InputControl) {
            return Presets.classic.Control;
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

  AreaExtensions.simpleNodesOrder(area);

  const onIndicatorPortsChanged = async (event: Event) => {
    const customEvent = event as CustomEvent<{ nodeId?: string }>;
    const nodeId = customEvent.detail?.nodeId;
    if (!nodeId) return;
    const node = editor.getNode(nodeId as Schemes["Node"]["id"]);
    if (!node) return;

    const outgoingConnections = editor
      .getConnections()
      .filter((connection) => String(connection.source) === nodeId);

    for (const connection of outgoingConnections) {
      await editor.removeConnection(connection.id);
    }

    void area.update("node", node.id);
  };
  window.addEventListener(
    INDICATOR_NODE_PORTS_CHANGED_EVENT,
    onIndicatorPortsChanged,
  );

  const handle: EditorHandle = {
    destroy: () => {
      window.removeEventListener(
        INDICATOR_NODE_PORTS_CHANGED_EVENT,
        onIndicatorPortsChanged,
      );
      area.destroy();
    },
    getGraphPayload: () => {
      const nodes = editor.getNodes().map((node) => {
        const controls = Object.fromEntries(
          Object.entries(node.controls as Record<string, unknown>).map(([key, control]) => {
            if (typeof control !== "object" || control == null) {
              return [key, null];
            }
            const inputLike = control as { value?: unknown; options?: { initial?: unknown } };
            const value = inputLike.value ?? inputLike.options?.initial;
            return [key, toSerializableControlValue(value)];
          }),
        );

        return {
          id: String(node.id),
          label: node.label,
          controls,
        };
      });

      const connections = editor.getConnections().map((connection) => ({
        id: String(connection.id),
        source: String(connection.source),
        sourceOutput: String(connection.sourceOutput),
        target: String(connection.target),
        targetInput: String(connection.targetInput),
      }));

      return { nodes, connections };
    },
  };

  return handle;
}
