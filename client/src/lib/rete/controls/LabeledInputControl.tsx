import { Presets } from "rete-react-plugin";
import { ClassicPreset } from "rete";

type InputType = "text" | "number";

type LabeledInputControlOptions<N extends InputType> = {
  label: string;
  hidden?: boolean;
} & ConstructorParameters<typeof ClassicPreset.InputControl<N>>[1];

export class LabeledInputControl<N extends InputType> extends ClassicPreset.InputControl<N> {
  readonly label: string;
  hidden: boolean;

  constructor(type: N, options: LabeledInputControlOptions<N>) {
    const { label, hidden, ...inputOptions } = options;
    super(type, inputOptions);
    this.label = label;
    this.hidden = hidden ?? false;
  }
}

export function LabeledInputControlComponent(props: {
  data: LabeledInputControl<InputType>;
}) {
  const { data } = props;

  if (data.hidden) {
    return null;
  }

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
