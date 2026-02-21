import { LabeledInputControl } from "./LabeledInputControl";
import { SelectControl } from "./SelectControl";

export type CustomControls = SelectControl | LabeledInputControl<"number">;
