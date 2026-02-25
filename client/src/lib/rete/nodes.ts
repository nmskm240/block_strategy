import { ClassicPreset } from "rete";
import {
  type BooleanLogicOperator,
  type GraphNode,
  type IndicatorKind,
  IndicatorRegistry,
  type MathOperator,
  NodeKind,
  OhlcvKind,
  type OrderMode,
  OrderSide,
  getIndicatorParamDefault,
} from "shared";

import {
  CustomControls,
  LabeledInputControl,
  SelectControl,
  StepperControl,
  getNumberControlValue,
  getSelectControlValue,
} from "./controls";
import { socket } from "./sockets";
import { ConditionOperators, LogicGateOperators, MathOperators } from "./types";

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
  private syncControlsByMode(mode: OrderMode) {
    const isExit = mode === "MARKET_EXIT";
    const sideControl = this.controls.side as SelectControl | undefined;
    const sizeControl = this.controls.size as
      | LabeledInputControl<"number">
      | undefined;
    if (sideControl) {
      sideControl.hidden = isExit;
    }
    if (sizeControl) {
      sizeControl.hidden = isExit;
    }
  }

  constructor() {
    super("Action");

    this.addInput("trigger", new ClassicPreset.Input(socket, "Trigger"));
    this.addControl(
      "mode",
      new SelectControl<OrderMode>({
        options: [
          { label: "Entry", value: "MARKET_ENTRY" },
          { label: "Exit", value: "MARKET_EXIT" },
        ],
        initial: "MARKET_ENTRY",
        change: (value) => {
          this.syncControlsByMode(value);
        },
      }),
    );
    this.addControl(
      "side",
      new SelectControl<OrderSide>({
        options: [
          { label: "Buy", value: "BUY" },
          { label: "Sell", value: "SELL" },
        ],
        initial: "BUY",
      }),
    );
    this.addControl(
      "size",
      new LabeledInputControl("number", { label: "Size", initial: 1 }),
    );

    this.syncControlsByMode("MARKET_ENTRY");
  }

  toGraphNode(): GraphNode {
    const actionType = getSelectControlValue(
      this.controls.mode,
      "MARKET_ENTRY",
    ) as OrderMode;
    const size = getNumberControlValue(this.controls.size, 1);

    if (actionType === "MARKET_EXIT") {
      return {
        id: String(this.id),
        spec: {
          kind: NodeKind.ACTION,
          actionType,
          params: {},
        },
      };
    }

    return {
      id: String(this.id),
      spec: {
        kind: NodeKind.ACTION,
        actionType,
        params: {
          side: getSelectControlValue(this.controls.side, "BUY"),
          size,
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
      this.addInput(key, new ClassicPreset.Input(socket, key.capitalize()));
    }
    for (const key of Object.keys(spec.shape.outputs.shape)) {
      this.addOutput(key, new ClassicPreset.Output(socket, key.capitalize()));
    }
    for (const key of Object.keys(spec.shape.params.shape)) {
      this.addControl(
        key,
        new LabeledInputControl("number", {
          label: key.capitalize(),
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

    const leftInput = new ClassicPreset.Input(socket, "Left");
    leftInput.addControl(
      new LabeledInputControl("number", { label: "Left", initial: 0 }),
    );
    this.addInput("left", leftInput);

    const rightInput = new ClassicPreset.Input(socket, "Right");
    rightInput.addControl(
      new LabeledInputControl("number", { label: "Right", initial: 0 }),
    );
    this.addInput("right", rightInput);

    this.addOutput("true", new ClassicPreset.Output(socket, "True"));
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

export class MathNode extends NodeBase {
  readonly operator: MathOperators;

  constructor(operator: MathOperators) {
    super(operator.toString());
    this.operator = operator;

    const leftInput = new ClassicPreset.Input(socket, "Left");
    leftInput.addControl(
      new LabeledInputControl("number", { label: "Left", initial: 0 }),
    );
    this.addInput("left", leftInput);

    const rightInput = new ClassicPreset.Input(socket, "Right");
    rightInput.addControl(
      new LabeledInputControl("number", { label: "Right", initial: 0 }),
    );
    this.addInput("right", rightInput);

    this.addOutput("value", new ClassicPreset.Output(socket, "Value"));
  }

  toGraphNode(): GraphNode {
    const left = getNumberControlValue(this.inputs.left?.control, 0);
    const right = getNumberControlValue(this.inputs.right?.control, 0);

    return {
      id: String(this.id),
      spec: {
        kind: NodeKind.MATH,
        operator: this.operator as MathOperator,
        inputs: {
          left,
          right,
        },
        outputs: {
          value: 0,
        },
      },
    };
  }
}

export class LogicGateNode extends NodeBase {
  readonly operator: LogicGateOperators;
  private isSyncingInputCountControl = false;
  private onStructureChanged?: (removedInputKeys: string[]) => void;

  constructor(operator: LogicGateOperators) {
    super(operator.toString());
    this.operator = operator;

    const initialInputCount = operator === LogicGateOperators.NOT ? 1 : 2;
    this.ensureInputCount(initialInputCount);

    if (operator !== LogicGateOperators.NOT) {
      this.addControl(
        "inputCount",
        new StepperControl({
          label: "Inputs",
          initial: initialInputCount,
          min: 2,
          max: 8,
          change: (value) => {
            if (this.isSyncingInputCountControl) {
              return;
            }
            this.setInputCount(value);
          },
        }),
      );
    }

    this.addOutput("true", new ClassicPreset.Output(socket, "True"));
  }

  setOnStructureChanged(callback: (removedInputKeys: string[]) => void): void {
    this.onStructureChanged = callback;
  }

  hasInputPort(input: ClassicPreset.Input<ClassicPreset.Socket>): boolean {
    return Object.values(this.inputs).some((nodeInput) => nodeInput === input);
  }

  private clampInputCount(value: number): number {
    if (!Number.isFinite(value)) {
      return this.operator === LogicGateOperators.NOT ? 1 : 2;
    }
    if (this.operator === LogicGateOperators.NOT) {
      return 1;
    }
    return Math.max(2, Math.min(8, Math.trunc(value)));
  }

  private toInputKey(index: number): string {
    return `in${index}`;
  }

  private getInputKeys(): string[] {
    return Object.keys(this.inputs).sort((a, b) => {
      const ai = Number.parseInt(a.replace(/^in/, ""), 10);
      const bi = Number.parseInt(b.replace(/^in/, ""), 10);
      return ai - bi;
    });
  }

  private ensureInputCount(count: number): string[] {
    const nextCount = this.clampInputCount(count);
    const currentKeys = this.getInputKeys();
    const removedInputKeys: string[] = [];

    if (currentKeys.length < nextCount) {
      for (let i = currentKeys.length; i < nextCount; i += 1) {
        const key = this.toInputKey(i);
        const input = new ClassicPreset.Input(socket, key.capitalize());
        // input.addControl(new ClassicPreset.InputControl("number", { initial: 0 }));
        this.addInput(key, input);
      }
    } else if (currentKeys.length > nextCount) {
      for (let i = currentKeys.length - 1; i >= nextCount; i -= 1) {
        const key = this.toInputKey(i);
        if (this.inputs[key]) {
          this.removeInput(key);
          removedInputKeys.push(key);
        }
      }
    }

    if (this.controls.inputCount instanceof StepperControl) {
      const currentValue = Number(this.controls.inputCount.value ?? nextCount);
      if (currentValue !== nextCount) {
        this.isSyncingInputCountControl = true;
        this.controls.inputCount.setValue(nextCount);
        this.isSyncingInputCountControl = false;
      }
    }

    return removedInputKeys;
  }

  setInputCount(value: number): void {
    const removedInputKeys = this.ensureInputCount(value);
    if (removedInputKeys.length > 0) {
      this.onStructureChanged?.(removedInputKeys);
    } else {
      this.onStructureChanged?.([]);
    }
  }

  toGraphNode(): GraphNode {
    const inputs = Object.fromEntries(
      this.getInputKeys().map((key) => [
        key,
        Boolean(getNumberControlValue(this.inputs[key]?.control, 0)),
      ]),
    );

    return {
      id: String(this.id),
      spec: {
        kind: NodeKind.BOOLEAN_LOGIC,
        operator: this.operator as BooleanLogicOperator,
        inputs,
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
      new SelectControl<OhlcvKind>({
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
