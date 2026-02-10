import { ClassicPreset } from "rete";
import type { NodeEditor } from "rete";

export type NodeType = "A" | "B" | "Indicator" | "Order" | "Condition";

export async function createNode(
  type: NodeType,
  editor: NodeEditor<any>,
  socket: ClassicPreset.Socket
): Promise<ClassicPreset.Node> {
  if (type === "A") {
    const node = new ClassicPreset.Node("A");
    node.addControl("a", new ClassicPreset.InputControl("text", { initial: "a" }));
    node.addOutput("a", new ClassicPreset.Output(socket));
    await editor.addNode(node);
    return node;
  }

  if (type === "B") {
    const node = new ClassicPreset.Node("B");
    node.addControl("b", new ClassicPreset.InputControl("text", { initial: "b" }));
    node.addInput("b", new ClassicPreset.Input(socket));
    await editor.addNode(node);
    return node;
  }

  if (type === "Indicator") {
    const node = new ClassicPreset.Node("Indicator");
    node.addControl(
      "indicator",
      new ClassicPreset.InputControl("text", { initial: "SMA" })
    );
    node.addControl(
      "period",
      new ClassicPreset.InputControl("number", { initial: 20 })
    );
    node.addOutput("out", new ClassicPreset.Output(socket, "value"));
    await editor.addNode(node);
    return node;
  }

  if (type === "Order") {
    const node = new ClassicPreset.Node("Order");
    node.addControl(
      "side",
      new ClassicPreset.InputControl("text", { initial: "BUY" })
    );
    node.addControl(
      "size",
      new ClassicPreset.InputControl("number", { initial: 1 })
    );
    node.addInput("trigger", new ClassicPreset.Input(socket, "trigger"));
    node.addOutput("filled", new ClassicPreset.Output(socket, "trigger"));
    await editor.addNode(node);
    return node;
  }

  const node = new ClassicPreset.Node("Condition");
  node.addInput("left", new ClassicPreset.Input(socket, "left"));
  node.addInput("right", new ClassicPreset.Input(socket, "right"));
  node.addControl(
    "left",
    new ClassicPreset.InputControl("text", { initial: "price" })
  );
  node.addControl("op", new ClassicPreset.InputControl("text", { initial: ">" }));
  node.addControl(
    "right",
    new ClassicPreset.InputControl("text", { initial: "SMA(20)" })
  );
  node.addOutput("true", new ClassicPreset.Output(socket, "true"));
  node.addOutput("false", new ClassicPreset.Output(socket, "false"));
  await editor.addNode(node);
  return node;
}
