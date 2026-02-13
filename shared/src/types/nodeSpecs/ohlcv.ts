import * as z from "zod";
import { NodeKind } from "./nodeKind";

export const OhlcvNodeSpecSchema = z
  .object({
    kind: z.literal(NodeKind.OHLCV),
    params: z
      .object({
        kind: z.enum(["OPEN", "HIGH", "LOW", "CLOSE", "VOLUME"]),
        symbol: z.string().nonempty(),
        timeframe: z.enum(["1m", "5m", "15m", "30m", "1h", "4h", "1d"]),
      })
      .strict(),
  })
  .strict();

export type OhlcvNodeSpec = z.infer<typeof OhlcvNodeSpecSchema>;
