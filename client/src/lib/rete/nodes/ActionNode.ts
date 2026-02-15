import { ClassicPreset } from "rete";
import { type ActionKind, ActionRegistry } from "shared";

import { socket } from "../sockets";
import { SelectControl } from "../controls";

type Inputs = {
  trigger: ClassicPreset.Socket;
};
type Outputs = Record<string, ClassicPreset.Socket>;
type Controls = Record<string, ClassicPreset.Control>;

export class ActionNode extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  private kind: ActionKind = "marketEntry";

  constructor() {
    super("Action");

    this.addInput("trigger", new ClassicPreset.Input(socket, "trigger"));
    this.addControl(
      "action",
      new SelectControl({
        options: Object.keys(ActionRegistry).map((e) => ({
          label: e,
          value: e,
        })),
        initial: this.kind,
        change: this._onChangeAction.bind(this),
      }),
    );
  }

  private _onChangeAction(value: string): void {
    this.kind = value as ActionKind;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<{ nodeId: string }>(
          ACTION_NODE_CONTROLS_CHANGED_EVENT,
          {
            detail: { nodeId: String(this.id) },
          },
        ),
      );
    }
  }
}
