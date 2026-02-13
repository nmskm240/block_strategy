import * as z from "zod";
import { OhlcvNodeSpecSchema } from "./ohlcv";
import { IndicatorNodeSpecSchema } from "./indicators";
import { ActionNodeSpecSchema } from "./actions";

export const NodeSpecSchema = z.union([
  OhlcvNodeSpecSchema,
  IndicatorNodeSpecSchema,
  ActionNodeSpecSchema,
]);

export type NodeSpec = z.infer<typeof NodeSpecSchema>;
