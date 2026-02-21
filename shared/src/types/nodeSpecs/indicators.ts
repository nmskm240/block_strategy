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

const EmaSchema = defineIndicatorNodeSchema(
  "ema",
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

const MomentumSchema = defineIndicatorNodeSchema(
  "momentum",
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
  "roc",
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
  "direction",
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
  "extrema",
  {},
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const TrendsSchema = defineIndicatorNodeSchema(
  "trends",
  {},
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const DaysRisingSchema = defineIndicatorNodeSchema(
  "daysRising",
  {},
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const DaysFallingSchema = defineIndicatorNodeSchema(
  "daysFalling",
  {},
  {
    source: z.number(),
  },
  {
    value: z.number(),
  },
);

const StreaksSchema = defineIndicatorNodeSchema(
  "streaks",
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
  "crsi",
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

const BBandPercentBSchema = defineIndicatorNodeSchema(
  "bbandPercentB",
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
  "bbandBandwidth",
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
  "macd",
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
  sma: SmaSchema,
  ema: EmaSchema,
  rsi: RsiSchema,
  momentum: MomentumSchema,
  roc: RocSchema,
  direction: DirectionSchema,
  extrema: ExtremaSchema,
  trends: TrendsSchema,
  daysRising: DaysRisingSchema,
  daysFalling: DaysFallingSchema,
  streaks: StreaksSchema,
  crsi: ConnersRsiSchema,
  bband: BBandSchema,
  bbandPercentB: BBandPercentBSchema,
  bbandBandwidth: BBandBandwidthSchema,
  macd: MacdSchema,
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
