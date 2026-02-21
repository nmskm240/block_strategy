import * as z from "zod";
import { NodeKind } from "./nodeKind";

export const OhlcvNodeSpecSchema = z
  .object({
    kind: z.literal(NodeKind.OHLCV),
    params: z
      .object({
        kind: z.enum(["OPEN", "HIGH", "LOW", "CLOSE", "VOLUME"]),
      })
      .strict(),
  })
  .strict();

export type OhlcvNodeSpec = z.infer<typeof OhlcvNodeSpecSchema>;
