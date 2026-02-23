import { BacktestResponseSchema } from "shared";
import type { BacktestRequest, BacktestResult } from "shared";
import { apiClient } from "@/services/apiClient";

export class BacktestApiClient {
  constructor(readonly api = apiClient) {}

  async runBacktest(request: BacktestRequest): Promise<BacktestResult> {
    const response = await this.api.post("/backtest", request);
    const parsed = BacktestResponseSchema.parse(response);

    return parsed.data.result;
  }
}
