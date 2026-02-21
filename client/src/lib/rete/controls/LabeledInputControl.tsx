import { Presets } from "rete-react-plugin";
import { ClassicPreset } from "rete";

type InputType = "text" | "number";

type LabeledInputControlOptions<N extends InputType> = {
  label: string;
} & ConstructorParameters<typeof ClassicPreset.InputControl<N>>[1];

export class LabeledInputControl<N extends InputType> extends ClassicPreset.InputControl<N> {
  readonly label: string;

  constructor(type: N, options: LabeledInputControlOptions<N>) {
    const { label, ...inputOptions } = options;
    super(type, inputOptions);
    this.label = label;
  }
}

export function LabeledInputControlComponent(props: {
  data: LabeledInputControl<InputType>;
}) {
  const { data } = props;

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
      <div style={{ flex: 1 }}>
        <Presets.classic.Control data={data} />
      </div>
    </div>
  );
}
