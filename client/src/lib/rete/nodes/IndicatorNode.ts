import { ClassicPreset } from "rete";
import { socket } from "../sockets";
import { SelectControl } from "../controls";

const options = [
  { label: "SMA", value: "SMA" },
  { label: "EMA", value: "EMA" },
  { label: "RSI", value: "RSI" },
  { label: "MACD", value: "MACD" },
  { label: "Bollinger Bands", value: "BB" },
];

type Inputs = {
  in: ClassicPreset.Socket;
};
type Outputs = {
  out: ClassicPreset.Socket;
};
type Controls = {
  indicator: SelectControl;
};

export class IndicatorNode extends ClassicPreset.Node<
  Inputs,
  Outputs,
  Controls
> {
  paramControlKeys: string[] = [];

  constructor() {
    super("Indicator");

    this.addInput("in", new ClassicPreset.Input(socket, "value"));
    this.addControl(
      "indicator",
      new SelectControl({
        options: options,
        initial: "SMA",
        change: this._onChangeIndicator.bind(this),
      }),
    );
    this.addOutput("out", new ClassicPreset.Output(socket, "value"));
  }

  // applyControls(key: string) {
  //   for (const key of this.paramControlKeys.splice(0)) {
  //     this.removeControl(key);
  //   }
  // }

  private _onChangeIndicator(value: string): void {
    console.log("Indicator changed to:", value);
    // this.applyControls(value);
  }
}
