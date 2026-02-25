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
  "SMA",
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

const EmaSchema = defineIndicatorNodeSchema(
  "EMA",
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
  "RSI",
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

const MomentumSchema = defineIndicatorNodeSchema(
  "Momentum",
  {
    period: z.number().int().min(1).default(10),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const RocSchema = defineIndicatorNodeSchema(
  "ROC",
  {
    period: z.number().int().min(1).default(10),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const DirectionSchema = defineIndicatorNodeSchema(
  "Direction",
  {
    period: z.number().int().min(1).default(10),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const ExtremaSchema = defineIndicatorNodeSchema(
  "Extrema",
  {},
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const TrendsSchema = defineIndicatorNodeSchema(
  "Trends",
  {},
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const DaysRisingSchema = defineIndicatorNodeSchema(
  "DaysRising",
  {},
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const DaysFallingSchema = defineIndicatorNodeSchema(
  "DaysFalling",
  {},
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const StreaksSchema = defineIndicatorNodeSchema(
  "Streaks",
  {
    period: z.number().int().min(1).default(3),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const ConnersRsiSchema = defineIndicatorNodeSchema(
  "CRSI",
  {
    rsiPeriod: z.number().int().min(1).default(3),
    streakRsiPeriod: z.number().int().min(1).default(2),
    percentRankPeriod: z.number().int().min(1).default(100),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const BBandSchema = defineIndicatorNodeSchema(
  "BBand",
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

const BBandPercentBSchema = defineIndicatorNodeSchema(
  "BBandPercentB",
  {
    period: z.number().int().min(1).default(20),
    stdDev: z.number().positive().default(2),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const BBandBandwidthSchema = defineIndicatorNodeSchema(
  "BBandBandwidth",
  {
    period: z.number().int().min(1).default(20),
    stdDev: z.number().positive().default(2),
  },
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const MacdSchema = defineIndicatorNodeSchema(
  "MACD",
  {
    shortPeriod: z.number().int().min(1).default(12),
    longPeriod: z.number().int().min(1).default(26),
    signalPeriod: z.number().int().min(1).default(9),
  },
  {
    source: z.number(),
  },
  {
    shortEMA: z.number(),
    longEMA: z.number(),
    macd: z.number(),
    signal: z.number(),
    histogram: z.number(),
  },
);

export const IndicatorRegistry = {
  SMA: SmaSchema,
  EMA: EmaSchema,
  RSI: RsiSchema,
  Momentum: MomentumSchema,
  ROC: RocSchema,
  Direction: DirectionSchema,
  Extrema: ExtremaSchema,
  Trends: TrendsSchema,
  DaysRising: DaysRisingSchema,
  DaysFalling: DaysFallingSchema,
  Streaks: StreaksSchema,
  CRSI: ConnersRsiSchema,
  BBand: BBandSchema,
  BBandPercentB: BBandPercentBSchema,
  BBandBandwidth: BBandBandwidthSchema,
  MACD: MacdSchema,
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
