import { useEffect, useState } from "react";
import { ClassicPreset } from "rete";

export type SelectOption<T = string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type SelectControlOptions<T = string> = {
  options: SelectOption<T>[];
  initial?: T;
  readonly?: boolean;
  hidden?: boolean;
  change?: (value: T) => void;
};

export class SelectControl<T = string> extends ClassicPreset.Control {
  value: T;
  readonly: boolean;
  hidden: boolean;
  options: SelectOption<T>[];
  initial?: T;
  private onChange?: (value: T) => void;

  constructor(options: SelectControlOptions<T>) {
    if (options.options.length <= 0) {
      throw new Error();
    }

    super();
    this.options = options.options;
    this.readonly = options.readonly ?? false;
    this.hidden = options.hidden ?? false;
    this.initial = options.initial;
    this.onChange = options.change;
    this.value = options.initial ?? this.options[0].value;
  }

  private findOptionIndex(value: T) {
    return this.options.findIndex((option) => Object.is(option.value, value));
  }

  setValue(value?: T) {
    if (typeof value === "undefined") {
      return;
    }
    if (this.findOptionIndex(value) < 0) {
      return;
    }

    this.value = value;
    if (this.onChange) {
      this.onChange(value);
    }
  }

  getSelectedIndex() {
    const index = this.findOptionIndex(this.value);
    return index >= 0 ? index : 0;
  }

  setValueByIndex(index: number) {
    const option = this.options[index];
    if (!option) {
      return;
    }
    this.setValue(option.value);
  }
}

export function SelectControlComponent(props: { data: SelectControl<unknown> }) {
  const { data } = props;
  const [selectedIndex, setSelectedIndex] = useState(data.getSelectedIndex());

  useEffect(() => {
    setSelectedIndex(data.getSelectedIndex());
  }, [data.value]);

  if (data.hidden) {
    return null;
  }

  return (
    <select
      value={String(selectedIndex)}
      disabled={data.readonly}
      onPointerDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        const nextIndex = Number(event.target.value);
        if (!Number.isInteger(nextIndex)) {
          return;
        }
        setSelectedIndex(nextIndex);
        data.setValueByIndex(nextIndex);
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
      {data.options.map((option, index) => (
        <option
          key={`${option.label}-${String(option.value)}`}
          value={String(index)}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
