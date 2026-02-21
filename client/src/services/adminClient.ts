import { ApiClient } from "@/services/apiClient";
import {
  OhlcvFileContentResponseSchema,
  OhlcvFileListResponseSchema,
  SeedOhlcvRequestSchema,
  SeedOhlcvResponseSchema,
  type OhlcvFileContentResponse,
  type OhlcvFileListResponse,
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

  async listOhlcvFiles(): Promise<OhlcvFileListResponse["data"]["files"]> {
    const response = await this.api.get("/admin/ohlcv-files");
    const parsed = OhlcvFileListResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error("Invalid response payload from admin list API");
    }
    return parsed.data.data.files;
  }

  async getOhlcvFileContent(key: string): Promise<OhlcvFileContentResponse["data"]> {
    const encodedKey = encodeURIComponent(key);
    const response = await this.api.get(`/admin/ohlcv-file?key=${encodedKey}`);
    const parsed = OhlcvFileContentResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error("Invalid response payload from admin file API");
    }
    return parsed.data.data;
  }
}
