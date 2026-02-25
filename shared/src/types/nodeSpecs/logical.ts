import * as z from "zod";
import { NodeKind } from "./nodeKind";

export const LogicalOperatorSchema = z.enum([
  "==",
  "!=",
  "<",
  "<=",
  ">",
  ">=",
  "CrossOver",
  "CrossDown",
]);

export const LogicalNodeSpecSchema = z
  .object({
    kind: z.literal(NodeKind.LOGICAL),
    operator: LogicalOperatorSchema,
    inputs: z
      .object({
        left: z.number(),
        right: z.number(),
      })
      .strict(),
    outputs: z
      .object({
        true: z.boolean(),
      })
      .strict(),
  })
  .strict();

export type LogicalOperator = z.infer<typeof LogicalOperatorSchema>;
export type LogicalNodeSpec = z.infer<typeof LogicalNodeSpecSchema>;
