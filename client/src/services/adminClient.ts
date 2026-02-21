import { ApiClient } from "@/services/apiClient";
import {
  ImportTwelveDataRequestSchema,
  ImportTwelveDataResponseSchema,
  OhlcvFileContentResponseSchema,
  OhlcvFileListResponseSchema,
  SeedOhlcvRequestSchema,
  SeedOhlcvResponseSchema,
  type ImportTwelveDataResponse,
  type OhlcvFileContentResponse,
  type OhlcvFileListResponse,
  type SeedOhlcvResponse,
  type SupportedSymbol,
} from "shared";

export type SeedOhlcvInput = {
  symbol?: SupportedSymbol;
  days?: number;
};

export type ImportTwelveDataInput = {
  symbol: SupportedSymbol;
  since: string;
  until: string;
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

  async importFromTwelveData(
    input: ImportTwelveDataInput,
  ): Promise<ImportTwelveDataResponse["data"]> {
    const payload = ImportTwelveDataRequestSchema.parse(input);
    const response = await this.api.post("/admin/import-twelvedata", payload);
    const parsed = ImportTwelveDataResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error("Invalid response payload from TwelveData import API");
    }
    return parsed.data.data;
  }
}
