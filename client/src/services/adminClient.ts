import { ApiClient } from "@/services/apiClient";
import {
  SeedOhlcvRequestSchema,
  SeedOhlcvResponseSchema,
  type SeedOhlcvResponse,
} from "shared";

export type SeedOhlcvInput = {
  symbol?: string;
  days?: number;
};

export class AdminApiClient {
  private api: ApiClient;

  constructor(api = new ApiClient()) {
    this.api = api;
  }

  async seedOhlcv(input: SeedOhlcvInput = {}): Promise<SeedOhlcvResponse["data"]> {
    const payload = SeedOhlcvRequestSchema.parse(input);
    const response = await this.api.post("/admin/seed-ohlcv", payload);
    const parsed = SeedOhlcvResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error("Invalid response payload from admin seed API");
    }
    return parsed.data.data;
  }
}
