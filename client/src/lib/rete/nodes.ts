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
  SelectControl,
  getNumberControlValue,
  getSelectControlValue,
  getTextControlValue,
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
      new ClassicPreset.InputControl("number", { initial: 1 }),
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
        new ClassicPreset.InputControl("number", {
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
      new ClassicPreset.InputControl("number", { initial: 0 }),
    );
    this.addInput("left", leftInput);

    const rightInput = new ClassicPreset.Input(socket, "right");
    rightInput.addControl(
      new ClassicPreset.InputControl("number", { initial: 0 }),
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
    this.addControl(
      "symbol",
      new ClassicPreset.InputControl("text", {
        initial: "NASDAQ:AAPL",
      }),
    );
    this.addControl(
      "timeframe",
      new SelectControl({
        options: [
          { label: "1m", value: "1m" },
          { label: "5m", value: "5m" },
          { label: "15m", value: "15m" },
          { label: "30m", value: "30m" },
          { label: "1h", value: "1h" },
          { label: "4h", value: "4h" },
          { label: "1d", value: "1d" },
        ],
        initial: "1h",
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
          symbol: getTextControlValue(this.controls.symbol, "NASDAQ:AAPL"),
          timeframe: getSelectControlValue(this.controls.timeframe, "1h"),
        },
      },
    };
  }
}
