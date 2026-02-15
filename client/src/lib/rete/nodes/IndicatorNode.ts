import { ClassicPreset } from "rete";
import { type IndicatorKind, IndicatorRegistry } from "shared";

import { socket } from "../sockets";
import { SelectControl } from "../controls";

export const INDICATOR_NODE_PORTS_CHANGED_EVENT =
  "indicator-node-ports-changed";

type Inputs = Record<string, ClassicPreset.Socket>;
type Outputs = Record<string, ClassicPreset.Socket>;
type Controls = {
  indicator: SelectControl;
};

export class IndicatorNode extends ClassicPreset.Node<
  Inputs,
  Outputs,
  Controls
> {
  paramControlKeys: string[] = [];
  private kind: IndicatorKind = "sma";

  constructor() {
    super("Indicator");

    this.addControl(
      "indicator",
      new SelectControl({
        options: Object.keys(IndicatorRegistry).map((e) => ({
          label: e,
          value: e,
        })),
        initial: this.kind,
        change: this._onChangeIndicator.bind(this),
      }),
    );
    this.applyPorts(this.kind);
  }

  private applyPorts(indicatorKind: IndicatorKind): void {
    const spec = IndicatorRegistry[indicatorKind];

    for (const key of Object.keys(this.inputs)) {
      this.removeInput(key);
    }
    for (const key of Object.keys(this.outputs)) {
      this.removeOutput(key);
    }

    for (const key of Object.keys(spec.shape.inputs.shape)) {
      this.addInput(key, new ClassicPreset.Input(socket, key));
    }
    for (const key of Object.keys(spec.shape.outputs.shape)) {
      this.addOutput(key, new ClassicPreset.Output(socket, key));
    }
  }

  private _onChangeIndicator(value: string): void {
    this.kind = value as IndicatorKind;
    this.applyPorts(this.kind);
    // FIXME: 暫定対応。イベントを投げるのがいいのかどうかは考える必要あり
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<{ nodeId: string }>(
          INDICATOR_NODE_PORTS_CHANGED_EVENT,
          {
            detail: { nodeId: String(this.id) },
          },
        ),
      );
    }
  }
}
