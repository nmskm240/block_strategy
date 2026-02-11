import { ClassicPreset } from "rete";

import type { OHLCV } from "shared/src/types";
import { socket } from "../sockets";

type Inputs = {
  value: ClassicPreset.Socket;
};
type Outputs = {
  open: ClassicPreset.Socket;
  high: ClassicPreset.Socket;
  low: ClassicPreset.Socket;
  close: ClassicPreset.Socket;
  volume: ClassicPreset.Socket;
};
type Controls = {
  value: ClassicPreset.InputControl<"number">;
};

export class OHLCVNode extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  private nextTimestamp = 0;

  constructor() {
    super("OHLCV");

    this.addOutput("open", new ClassicPreset.Output(socket, "Open", true));
    this.addOutput("high", new ClassicPreset.Output(socket, "High", true));
    this.addOutput("low", new ClassicPreset.Output(socket, "Low", true));
    this.addOutput("close", new ClassicPreset.Output(socket, "Close", true));
    this.addOutput("volume", new ClassicPreset.Output(socket, "Volume", true));
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
