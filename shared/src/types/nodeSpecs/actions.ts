import * as z from "zod";
import { NodeKind } from "./nodeKind";

function defineActionNodeSchema<TParam extends z.ZodRawShape>(
  actionType: string,
  params: TParam,
) {
  return z
    .object({
      kind: z.literal(NodeKind.ACTION),
      actionType: z.literal(actionType),
      params: z.object(params).strict(),
    })
    .strict();
}

const MarketEntrySchema = defineActionNodeSchema("marketEntry", {
  side: z.enum(["BUY", "SELL"]),
  size: z.number().positive(),
});
const MarketExitSchema = defineActionNodeSchema("marketExit", {
  size: z.number().positive(),
});

export const ActionRegistry = {
  marketEntry: MarketEntrySchema,
  marketExit: MarketExitSchema,
} as const;

export type ActionKind = keyof typeof ActionRegistry;

export const ActionNodeSpecSchema = z.discriminatedUnion(
  "actionType",
  Object.values(ActionRegistry) as [
    (typeof ActionRegistry)[keyof typeof ActionRegistry],
    ...(typeof ActionRegistry)[keyof typeof ActionRegistry][],
  ],
);

export type ActionNodeSpec = z.infer<typeof ActionNodeSpecSchema>;
