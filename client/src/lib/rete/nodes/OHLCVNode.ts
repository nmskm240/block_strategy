import { ClassicPreset } from "rete";

import type { OHLCV, OhlcvNodeSpec } from "shared";
import { SelectControl } from "../controls";
import { socket } from "../sockets";

type OhlcvKind = OhlcvNodeSpec["params"]["kind"];

const kindOptions: { label: string; value: OhlcvKind }[] = [
  { label: "Open", value: "OPEN" },
  { label: "High", value: "HIGH" },
  { label: "Low", value: "LOW" },
  { label: "Close", value: "CLOSE" },
  { label: "Volume", value: "VOLUME" },
];

type Inputs = Record<string, never>;
type Outputs = {
  value: ClassicPreset.Socket;
};
type Controls = {
  kind: SelectControl;
};

export class OHLCVNode extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  private nextTimestamp = 0;

  constructor() {
    super("OHLCV");

    this.addControl(
      "kind",
      new SelectControl({
        options: kindOptions,
        initial: "CLOSE",
      }),
    );
    this.addOutput("value", new ClassicPreset.Output(socket, "Value", true));
  }

  data(): OHLCV {
    // TODO: 実データを取得するロジックに置き換える
    const base = 100 + Math.random() * 50;
    const open = base + (Math.random() - 0.5) * 4;
    const close = base + (Math.random() - 0.5) * 4;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    const volume = 1000 + Math.random() * 9000;

    return {
      timestamp: this.nextTimestamp++,
      open,
      high,
      low,
      close,
      volume,
    };
  }
}
