import { createRoot } from "react-dom/client";
import { ClassicPreset, NodeEditor } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { Presets, ReactPlugin } from "rete-react-plugin";
import { contextMenu } from "./context";
import { SelectControl, SelectControlComponent } from "./controls";
import type { AreaExtra, Schemes } from "./types";
import type { Graph } from "shared";

export type EditorHandle = {
  destroy: () => void;
  getGraph: () => Graph;
};

export async function createEditor(container: HTMLElement) {
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

  const handle: EditorHandle = {
    destroy: () => {
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
