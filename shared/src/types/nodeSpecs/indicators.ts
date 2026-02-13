import * as z from "zod";
import { NodeKind } from "./nodeKind";

function defineIndicatorNodeSchema<
  TParam extends z.ZodRawShape,
  TInputs extends z.ZodRawShape,
  TOutputs extends z.ZodRawShape,
>(indicatorType: string, params: TParam, inputs: TInputs, outputs: TOutputs) {
  return z.object({
    kind: z.literal(NodeKind.INDICATOR),
    indicatorType: z.literal(indicatorType),
    params: z.object(params).strict(),
    inputs: z.object(inputs).strict(),
    outputs: z.object(outputs).strict(),
  });
}

export const SmaSpecSchema = defineIndicatorNodeSchema(
  "SMA",
  {
    period: z.number().int().min(1),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);
export type SmaSpec = z.infer<typeof SmaSpecSchema>;

export const RsiSpecSchema = defineIndicatorNodeSchema(
  "RSI",
  {
    period: z.number().int().min(1),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);
export type RsiSpec = z.infer<typeof RsiSpecSchema>;

export const BBandSpecSchema = defineIndicatorNodeSchema(
  "BBAND",
  {
    period: z.number().int().min(1),
    stdDev: z.number().positive(),
  },
  {
    source: z.number(),
  },
  {
    upperBand: z.number(),
    middleBand: z.number(),
    lowerBand: z.number(),
  },
);
export type BBandSpec = z.infer<typeof BBandSpecSchema>;

export const IndicatorNodeSpecSchema = z.discriminatedUnion("indicatorType", [
  SmaSpecSchema,
  RsiSpecSchema,
  BBandSpecSchema,
]);
export type IndicatorNodeSpec = z.infer<typeof IndicatorNodeSpecSchema>;
