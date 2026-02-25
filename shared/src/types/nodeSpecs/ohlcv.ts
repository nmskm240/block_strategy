import * as z from "zod";
import { NodeKind } from "./nodeKind";
import { OhlcvKind } from "../trade";

export const OhlcvNodeSpecSchema = z
  .object({
    kind: z.literal(NodeKind.OHLCV),
    params: z
      .object({
        kind: OhlcvKind,
      })
      .strict(),
  })
  .strict();

export type OhlcvNodeSpec = z.infer<typeof OhlcvNodeSpecSchema>;
