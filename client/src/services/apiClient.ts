import { HttpClient, HttpClientError } from "shared";

export class ApiClientError extends HttpClientError {}

type ApiClientOptions = {
  baseUrl?: string;
};

export class ApiClient {
  private client: HttpClient;

  constructor(options: ApiClientOptions = {}) {
    const defaultBaseUrl = import.meta.env.DEV
      ? (import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000/api")
      : "/api";
    const baseUrl = options.baseUrl ?? defaultBaseUrl;
    this.client = this.createClient(baseUrl);
  }

  async post<TBody>(path: string, body: TBody): Promise<unknown> {
    try {
      return await this.client.post(path, body);
    } catch (error) {
      throw this.toApiClientError(error);
    }
  }

  async get(path: string): Promise<unknown> {
    try {
      return await this.client.get(path);
    } catch (error) {
      throw this.toApiClientError(error);
    }
  }

  private toApiClientError(error: unknown): Error {
    if (error instanceof HttpClientError) {
      return new ApiClientError(error.message, error.status, error.details, error.url);
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }

  private createClient(baseUrl: string): HttpClient {
    return new HttpClient({
      baseUrl,
      connectivityErrorMessage: (requestUrl) =>
        `Cannot connect to API server at ${requestUrl}. Is the server running?`,
      maxConnectivityRetries: 8,
      retryDelayMs: 300,
    });
  }
}

export const apiClient = new ApiClient();
