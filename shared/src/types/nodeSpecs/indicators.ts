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

const SmaSchema = defineIndicatorNodeSchema(
  "sma",
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

const RsiSchema = defineIndicatorNodeSchema(
  "rsi",
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

const BBandSchema = defineIndicatorNodeSchema(
  "bband",
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

export const IndicatorRegistry = {
  sma: SmaSchema,
  rsi: RsiSchema,
  bband: BBandSchema,
} as const;

export type IndicatorKind = keyof typeof IndicatorRegistry;

export const IndicatorNodeSpecSchema = z.discriminatedUnion(
  "indicatorType",
  Object.values(IndicatorRegistry) as [
    (typeof IndicatorRegistry)[keyof typeof IndicatorRegistry],
    ...(typeof IndicatorRegistry)[keyof typeof IndicatorRegistry][],
  ],
);
export type IndicatorNodeSpec = z.infer<typeof IndicatorNodeSpecSchema>;
