import { useEffect, useState } from "react";
import { ClassicPreset } from "rete";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectControlOptions = {
  options: SelectOption[];
  initial?: string;
  readonly?: boolean;
  change?: (value: string) => void;
};

export class SelectControl extends ClassicPreset.Control {
  value: string;
  readonly: boolean;
  options: SelectOption[];
  initial?: string;
  private onChange?: (value: string) => void;

  constructor(options: SelectControlOptions) {
    if (options.options.length <= 0) {
      throw new Error();
    }

    super();
    this.options = options.options;
    this.readonly = options.readonly ?? false;
    this.initial = options.initial;
    this.onChange = options.change;
    this.value = options.initial ?? this.options[0].value;
  }

  setValue(value?: string) {
    if (!value) {
      return;
    }

    this.value = value;
    if (this.onChange && typeof value !== "undefined") {
      this.onChange(value);
    }
  }
}

export function SelectControlComponent(props: { data: SelectControl }) {
  const { data } = props;
  const [value, setValue] = useState(data.value);

  useEffect(() => {
    setValue(data.value);
  }, [data.value]);

  return (
    <select
      value={value}
      disabled={data.readonly}
      onPointerDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        const next = event.target.value;
        setValue(next);
        data.setValue(next);
      }}
      style={{
        width: "100%",
        borderRadius: 30,
        backgroundColor: "white",
        padding: "2px 6px",
        border: "1px solid #999",
        fontSize: "110%",
        boxSizing: "border-box",
      }}
    >
      {data.options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
