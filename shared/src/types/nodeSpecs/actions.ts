import * as z from "zod";
import { NodeKind } from "./nodeKind";

// FIXME: Entry/Exitで分けるべきかも
export const ActionNodeSpecSchema = z
  .object({
    kind: z.literal(NodeKind.ACTION),
    actionType: z.string(),
    params: z.record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()]),
    ),
  })
  .strict();

export type ActionNodeSpec = z.infer<typeof ActionNodeSpecSchema>;
