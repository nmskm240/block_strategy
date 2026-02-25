import { OhlcvKind, OrderMode, OrderSide } from "shared";
import { LabeledInputControl } from "./LabeledInputControl";
import { SelectControl } from "./SelectControl";
import { StepperControl } from "./StepperControl";

export type CustomControls =
  | SelectControl<OhlcvKind>
  | SelectControl<OrderMode>
  | SelectControl<OrderSide>
  | LabeledInputControl<"number">
  | StepperControl;
