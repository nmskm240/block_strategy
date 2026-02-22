import * as z from "zod";
import { NodeKind } from "./nodeKind";

export const BooleanLogicOperatorSchema = z.enum(["AND", "OR", "NOT"]);

const BooleanLogicInputsSchema = z
  .record(z.string().regex(/^in\d+$/), z.boolean())
  .superRefine((inputs, ctx) => {
    if (Object.keys(inputs).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "at least one input is required",
      });
    }
  });

export const BooleanLogicNodeSpecSchema = z
  .object({
    kind: z.literal(NodeKind.BOOLEAN_LOGIC),
    operator: BooleanLogicOperatorSchema,
    inputs: BooleanLogicInputsSchema,
    outputs: z
      .object({
        true: z.boolean(),
      })
      .strict(),
  })
  .superRefine((spec, ctx) => {
    const inputCount = Object.keys(spec.inputs).length;
    if (spec.operator === "NOT" && inputCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NOT requires exactly one input",
        path: ["inputs"],
      });
    }
    if ((spec.operator === "AND" || spec.operator === "OR") && inputCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${spec.operator} requires at least two inputs`,
        path: ["inputs"],
      });
    }
  })
  .strict();

export type BooleanLogicOperator = z.infer<typeof BooleanLogicOperatorSchema>;
export type BooleanLogicNodeSpec = z.infer<typeof BooleanLogicNodeSpecSchema>;
