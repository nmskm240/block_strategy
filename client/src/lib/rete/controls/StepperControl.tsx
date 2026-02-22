import { useEffect, useState } from "react";
import { ClassicPreset } from "rete";

export type StepperControlOptions = {
  label: string;
  initial?: number;
  min: number;
  max: number;
  readonly?: boolean;
  change?: (value: number) => void;
};

export class StepperControl extends ClassicPreset.Control {
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly readonly: boolean;
  value: number;
  private onChange?: (value: number) => void;

  constructor(options: StepperControlOptions) {
    super();
    this.label = options.label;
    this.min = options.min;
    this.max = options.max;
    this.readonly = options.readonly ?? false;
    this.onChange = options.change;

    const initial = options.initial ?? options.min;
    this.value = this.clamp(initial);
  }

  private clamp(value: number): number {
    if (!Number.isFinite(value)) {
      return this.min;
    }
    return Math.max(this.min, Math.min(this.max, Math.trunc(value)));
  }

  setValue(value: number): void {
    const next = this.clamp(value);
    this.value = next;
    this.onChange?.(next);
  }

  increment(): void {
    if (this.readonly) {
      return;
    }
    this.setValue(this.value + 1);
  }

  decrement(): void {
    if (this.readonly) {
      return;
    }
    this.setValue(this.value - 1);
  }
}

export function StepperControlComponent(props: { data: StepperControl }) {
  const { data } = props;
  const [value, setValue] = useState(data.value);

  useEffect(() => {
    setValue(data.value);
  }, [data.value]);

  const buttonStyle = {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "1px solid rgba(220, 230, 220, 0.8)",
    background: "rgba(64, 64, 64, 0.9)",
    color: "#f0f5ef",
    fontSize: 14,
    lineHeight: "20px",
    cursor: "pointer",
    padding: 0,
  } as const;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: 12,
          lineHeight: 1.2,
          minWidth: 44,
          textAlign: "left",
        }}
      >
        {data.label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginLeft: "auto",
        }}
      >
        <button
          type="button"
          disabled={data.readonly || value <= data.min}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            data.decrement();
            setValue(data.value);
          }}
          style={buttonStyle}
        >
          -
        </button>
        <span
          style={{
            minWidth: 20,
            textAlign: "center",
            color: "#f1f6ef",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {value}
        </span>
        <button
          type="button"
          disabled={data.readonly || value >= data.max}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            data.increment();
            setValue(data.value);
          }}
          style={buttonStyle}
        >
          +
        </button>
      </div>
    </div>
  );
}
