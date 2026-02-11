import { BacktestRequestSchema, BacktestResponseSchema } from "shared";
import type { BacktestResult, GraphPayload } from "@/types";
import { ApiClient } from "@/services/api-client";

export type RunBacktestInput = {
  symbol: string;
  graph: GraphPayload;
  initialCash?: number;
};

export class BacktestApiClient {
  private api: ApiClient;

  constructor(api = new ApiClient()) {
    this.api = api;
  }

  async runBacktest(input: RunBacktestInput): Promise<BacktestResult> {
    const payload = BacktestRequestSchema.parse(input);
    const response = await this.api.post("/backtest", payload);
    const parsed = BacktestResponseSchema.safeParse(response);

    if (!parsed.success) {
      throw new Error("Invalid response payload from backtest API");
    }

    return parsed.data.data.result;
  }
}
