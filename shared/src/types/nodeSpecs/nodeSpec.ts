import * as z from "zod";
import { OhlcvNodeSpecSchema } from "./ohlcv";
import { IndicatorNodeSpecSchema } from "./indicators";
import { ActionNodeSpecSchema } from "./actions";
import { LogicalNodeSpecSchema } from "./logical";

export const NodeSpecSchema = z.union([
  OhlcvNodeSpecSchema,
  IndicatorNodeSpecSchema,
  ActionNodeSpecSchema,
  LogicalNodeSpecSchema,
]);

export type NodeSpec = z.infer<typeof NodeSpecSchema>;
