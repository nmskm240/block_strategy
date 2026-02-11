import { ClassicPreset } from "rete";
import { socket } from "../sockets";
import { SelectControl } from "../controls";
import { ConditionOperators } from "../types";

const options = [
  { label: "==", value: ConditionOperators.EQUALS },
  { label: "!=", value: ConditionOperators.NOT_EQUALS },
  { label: "<", value: ConditionOperators.LESS_THAN },
  { label: "<=", value: ConditionOperators.LESS_THAN_OR_EQUALS },
  { label: ">", value: ConditionOperators.GREATER_THAN },
  { label: ">=", value: ConditionOperators.GREATER_THAN_OR_EQUALS },
];

type Inputs = {
  left: ClassicPreset.Socket;
  right: ClassicPreset.Socket;
};
type Outputs = {
  true: ClassicPreset.Socket;
  false: ClassicPreset.Socket;
};
type Controls = {
  operator: SelectControl;
};

export class ConditionNode extends ClassicPreset.Node<
  Inputs,
  Outputs,
  Controls
> {
  constructor() {
    super("Condition");

    this.addInput("left", new ClassicPreset.Input(socket, "left"));
    this.addInput("right", new ClassicPreset.Input(socket, "right"));
    this.addControl(
      "operator",
      new SelectControl({ options, initial: ConditionOperators.EQUALS }),
    );
    this.addOutput("true", new ClassicPreset.Output(socket, "true"));
    this.addOutput("false", new ClassicPreset.Output(socket, "false"));
  }
}
