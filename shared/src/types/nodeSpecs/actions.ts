import * as z from "zod";
import { NodeKind } from "./nodeKind";
import { OrderMode, OrderSide } from "../trade";

function defineActionNodeSchema<TParam extends z.ZodRawShape>(
  actionType: OrderMode,
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

const MarketEntrySchema = defineActionNodeSchema(OrderMode.enum.MARKET_ENTRY, {
  side: OrderSide,
  size: z.number().positive(),
});
const MarketExitSchema = defineActionNodeSchema(OrderMode.enum.MARKET_EXIT, {});

export const ActionNodeSpecSchema = z.discriminatedUnion("actionType", [
  MarketEntrySchema,
  MarketExitSchema,
]);

export type ActionNodeSpec = z.infer<typeof ActionNodeSpecSchema>;
