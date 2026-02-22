import { LabeledInputControl } from "./LabeledInputControl";
import { SelectControl } from "./SelectControl";
import { StepperControl } from "./StepperControl";

export type CustomControls =
  | SelectControl
  | LabeledInputControl<"number">
  | StepperControl;
