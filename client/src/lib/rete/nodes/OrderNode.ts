import { ClassicPreset } from "rete";
import { socket } from "../sockets";

type Inputs = {
  trigger: ClassicPreset.Socket;
};
type Outputs = {
  order: ClassicPreset.Socket;
};

type Controls = {
  side: ClassicPreset.InputControl<"text">;
  size: ClassicPreset.InputControl<"number">;
};

export class OrderNode extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  constructor() {
    super("Order");

    this.addInput("trigger", new ClassicPreset.Input(socket, "trigger"));
    this.addControl(
      "side",
      new ClassicPreset.InputControl("text", {
        initial: "buy",
      }),
    );
    this.addControl(
      "size",
      new ClassicPreset.InputControl("number", {
        initial: 1,
      }),
    );
    this.addOutput("order", new ClassicPreset.Output(socket, "order"));
  }
}
