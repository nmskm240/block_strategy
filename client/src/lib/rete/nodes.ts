import { ClassicPreset } from "rete";
import {
  ActionKind,
  type GraphNode,
  getIndicatorParamDefault,
  type IndicatorKind,
  IndicatorRegistry,
  NodeKind,
} from "shared";

import {
  CustomControls,
  LabeledInputControl,
  SelectControl,
  getNumberControlValue,
  getSelectControlValue,
} from "./controls";
import { socket } from "./sockets";
import { ConditionOperators } from "./types";

export abstract class NodeBase extends ClassicPreset.Node<
  Record<string, ClassicPreset.Socket>,
  Record<string, ClassicPreset.Socket>,
  Record<
    string,
    | CustomControls
    | ClassicPreset.InputControl<"number">
    | ClassicPreset.InputControl<"text">
  >
> {
  abstract toGraphNode(): GraphNode;
}

export class ActionNode extends NodeBase {
  readonly kind: ActionKind = "marketEntry";

  constructor() {
    super("Action");

    this.addInput("trigger", new ClassicPreset.Input(socket, "trigger"));
    this.addControl(
      "side",
      new SelectControl({
        options: [
          { label: "Buy", value: "BUY" },
          { label: "Sell", value: "SELL" },
        ],
        initial: "BUY",
      }),
    );
    this.addControl(
      "size",
      new LabeledInputControl("number", { label: "size", initial: 1 }),
    );
  }

  toGraphNode(): GraphNode {
    return {
      id: String(this.id),
      spec: {
        kind: NodeKind.ACTION,
        actionType: this.kind,
        params: {
          side: getSelectControlValue(this.controls.side, "BUY"),
          size: getNumberControlValue(this.controls.size, 1),
        },
      },
    };
  }
}

export class IndicatorNode extends NodeBase {
  readonly kind: IndicatorKind;

  constructor(kind: IndicatorKind) {
    super(kind);
    this.kind = kind;

    const spec = IndicatorRegistry[kind];
    if (!spec) {
      throw new Error(`Unknown indicator kind: ${kind}`);
    }
    for (const key of Object.keys(spec.shape.inputs.shape)) {
      this.addInput(key, new ClassicPreset.Input(socket, key));
    }
    for (const key of Object.keys(spec.shape.outputs.shape)) {
      this.addOutput(key, new ClassicPreset.Output(socket, key));
    }
    for (const key of Object.keys(spec.shape.params.shape)) {
      this.addControl(
        key,
        new LabeledInputControl("number", {
          label: key,
          initial: getIndicatorParamDefault(this.kind, key),
        }),
      );
    }
  }

  toGraphNode(): GraphNode {
    const params = Object.fromEntries(
      Object.keys(IndicatorRegistry[this.kind].shape.params.shape).map(
        (key) => [
          key,
          getNumberControlValue(
            this.controls[key],
            getIndicatorParamDefault(this.kind, key),
          ),
        ],
      ),
    );
    const inputs = Object.fromEntries(
      Object.keys(IndicatorRegistry[this.kind].shape.inputs.shape).map(
        (key) => [key, 0],
      ),
    );
    const outputs = Object.fromEntries(
      Object.keys(IndicatorRegistry[this.kind].shape.outputs.shape).map(
        (key) => [key, 0],
      ),
    );
    const spec = {
      kind: NodeKind.INDICATOR,
      indicatorType: this.kind,
      params,
      inputs,
      outputs,
    } as GraphNode["spec"];

    return {
      id: String(this.id),
      spec,
    };
  }
}

export class LogicalNode extends NodeBase {
  readonly operator: ConditionOperators;

  constructor(operator: ConditionOperators) {
    super(operator.toString());
    this.operator = operator;

    const leftInput = new ClassicPreset.Input(socket, "left");
    leftInput.addControl(
      new LabeledInputControl("number", { label: "left", initial: 0 }),
    );
    this.addInput("left", leftInput);

    const rightInput = new ClassicPreset.Input(socket, "right");
    rightInput.addControl(
      new LabeledInputControl("number", { label: "right", initial: 0 }),
    );
    this.addInput("right", rightInput);

    this.addOutput("true", new ClassicPreset.Output(socket, "true"));
  }

  toGraphNode(): GraphNode {
    const left = getNumberControlValue(this.inputs.left?.control, 0);
    const right = getNumberControlValue(this.inputs.right?.control, 0);

    return {
      id: String(this.id),
      spec: {
        kind: NodeKind.LOGICAL,
        operator: this.operator,
        inputs: {
          left,
          right,
        },
        outputs: {
          true: true,
        },
      },
    };
  }
}

export class OHLCVNode extends NodeBase {
  constructor() {
    super("OHLCV");

    this.addOutput("value", new ClassicPreset.Output(socket, "Value", true));
    this.addControl(
      "kind",
      new SelectControl({
        options: [
          { label: "Open", value: "OPEN" },
          { label: "High", value: "HIGH" },
          { label: "Low", value: "LOW" },
          { label: "Close", value: "CLOSE" },
          { label: "Volume", value: "VOLUME" },
        ],
        initial: "CLOSE",
      }),
    );
  }

  toGraphNode(): GraphNode {
    return {
      id: String(this.id),
      spec: {
        kind: NodeKind.OHLCV,
        params: {
          kind: getSelectControlValue(this.controls.kind, "CLOSE"),
        },
      },
    };
  }
}
