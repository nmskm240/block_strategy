import * as z from "zod";
import { OhlcvNodeSpecSchema } from "./ohlcv";
import { IndicatorNodeSpecSchema } from "./indicators";
import { ActionNodeSpecSchema } from "./actions";
import { LogicalNodeSpecSchema } from "./logical";
import { BooleanLogicNodeSpecSchema } from "./booleanLogic";

export const NodeSpecSchema = z.union([
  OhlcvNodeSpecSchema,
  IndicatorNodeSpecSchema,
  ActionNodeSpecSchema,
  LogicalNodeSpecSchema,
  BooleanLogicNodeSpecSchema,
]);

export type NodeSpec = z.infer<typeof NodeSpecSchema>;
