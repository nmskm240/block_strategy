import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets, ReactArea2D } from "rete-react-plugin";
import { createNode, type NodeType } from "./editor/nodes";
import type { GraphSnapshot } from "./types/trading";

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = ReactArea2D<Schemes>;

export type EditorApi = {
  destroy: () => void;
  addNode: (type: NodeType) => Promise<void>;
  getGraph: () => GraphSnapshot;
};

export async function createEditor(container: HTMLElement): Promise<EditorApi> {
  const socket = new ClassicPreset.Socket("socket");

  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(Presets.classic.setup());

  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);

  AreaExtensions.simpleNodesOrder(area);

  let nodeCount = 0;

  async function placeNode(node: ClassicPreset.Node) {
    const base = area.area.pointer;
    const offset = 30 * (nodeCount % 10);
    nodeCount += 1;
    await area.translate(node.id, { x: base.x + offset, y: base.y + offset });
  }

  const a = await createNode("A", editor, socket);
  const b = await createNode("B", editor, socket);

  await editor.addConnection(new ClassicPreset.Connection(a, "a", b, "b"));

  await area.translate(a.id, { x: 0, y: 0 });
  await area.translate(b.id, { x: 270, y: 0 });

  setTimeout(() => {
    // wait until nodes rendered because they dont have predefined width and height
    AreaExtensions.zoomAt(area, editor.getNodes());
  }, 10);
  return {
    destroy: () => area.destroy(),
    addNode: async (type: NodeType) => {
      const node = await createNode(type, editor, socket);
      await placeNode(node);
    },
    getGraph: () => ({
      nodes: editor.getNodes(),
      connections: editor.getConnections(),
    }),
  };
}
