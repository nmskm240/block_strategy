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
    period: z.number().int().min(1).default(20),
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
    period: z.number().int().min(1).default(20),
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
    period: z.number().int().min(1).default(20),
    stdDev: z.number().positive().default(2),
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

export function getIndicatorParamDefault(
  kind: IndicatorKind,
  key: string,
  fallback = 0,
): number {
  const paramsShape = IndicatorRegistry[kind].shape.params.shape as Record<
    string,
    z.ZodTypeAny
  >;
  const schema = paramsShape[key];
  if (!schema) return fallback;

  const parsed = schema.safeParse(undefined);
  if (!parsed.success || typeof parsed.data !== "number") return fallback;
  return parsed.data;
}

export const IndicatorNodeSpecSchema = z.discriminatedUnion(
  "indicatorType",
  Object.values(IndicatorRegistry) as [
    (typeof IndicatorRegistry)[keyof typeof IndicatorRegistry],
    ...(typeof IndicatorRegistry)[keyof typeof IndicatorRegistry][],
  ],
);
export type IndicatorNodeSpec = z.infer<typeof IndicatorNodeSpecSchema>;
