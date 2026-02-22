import * as z from "zod";
import { NodeKind } from "./nodeKind";

export const MathOperatorSchema = z.enum(["+", "-", "*", "/", "%"]);

export const MathNodeSpecSchema = z
  .object({
    kind: z.literal(NodeKind.MATH),
    operator: MathOperatorSchema,
    inputs: z
      .object({
        left: z.number(),
        right: z.number(),
      })
      .strict(),
    outputs: z
      .object({
        value: z.number(),
      })
      .strict(),
  })
  .strict();

export type MathOperator = z.infer<typeof MathOperatorSchema>;
export type MathNodeSpec = z.infer<typeof MathNodeSpecSchema>;
