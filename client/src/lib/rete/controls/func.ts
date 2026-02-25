import { ClassicPreset } from "rete";
import { SelectControl } from "./SelectControl";

export function getNumberControlValue(
  control: unknown,
  fallback: number,
): number {
  if (!(control instanceof ClassicPreset.InputControl)) return fallback;
  const raw = control.value;
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw)
        : Number.NaN;
  if (!Number.isFinite(value)) return fallback;
  return value;
}

export function getTextControlValue(control: unknown, fallback: string): string {
  if (!(control instanceof ClassicPreset.InputControl)) return fallback;
  const raw = control.value;
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  return value.length > 0 ? value : fallback;
}

export function getSelectControlValue<T>(control: unknown, fallback: T): T {
  if (!(control instanceof SelectControl)) return fallback;
  return control.value as T;
}
