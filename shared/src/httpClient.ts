import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export class HttpClientError extends Error {
  status: number;
  details: unknown;
  url: string;

  constructor(message: string, status: number, details: unknown, url: string) {
    super(message);
    this.name = "HttpClientError";
    this.status = status;
    this.details = details;
    this.url = url;
  }
}

export type HttpClientOptions = {
  baseUrl: string;
  defaultHeaders?: RequestInit["headers"];
  fetchImpl?: typeof fetch;
  connectivityErrorMessage?: (url: string) => string;
  maxConnectivityRetries?: number;
  retryDelayMs?: number;
};

function normalizeHeaders(headers?: RequestInit["headers"]): Record<string, string> {
  if (!headers) return {};
  const normalized: Record<string, string> = {};
  const headerBag = new Headers(headers);
  headerBag.forEach((value, key) => {
    normalized[key] = value;
  });
  return normalized;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly connectivityErrorMessage?: (url: string) => string;
  private readonly maxConnectivityRetries: number;
  private readonly retryDelayMs: number;
  private readonly axios: AxiosInstance;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl ?? "";
    this.defaultHeaders = normalizeHeaders(options.defaultHeaders);
    this.connectivityErrorMessage = options.connectivityErrorMessage;
    this.maxConnectivityRetries = options.maxConnectivityRetries ?? 0;
    this.retryDelayMs = options.retryDelayMs ?? 250;
    this.axios = axios.create({
      baseURL: this.baseUrl || undefined,
      headers: this.defaultHeaders,
    });
  }

  async get(path: string, init: Omit<RequestInit, "method"> = {}): Promise<unknown> {
    return this.request(path, { ...init, method: "GET" });
  }

  async post<TBody>(
    path: string,
    body: TBody,
    init: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<unknown> {
    return this.request(path, {
      ...init,
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...normalizeHeaders(init.headers),
      },
      body: JSON.stringify(body),
    });
  }

  async request(path: string, init: RequestInit): Promise<unknown> {
    const requestUrl = this.toUrl(path);
    const config = this.toAxiosConfig(path, init);
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxConnectivityRetries; attempt += 1) {
      try {
        const response = await this.axios.request(config);
        return response.data;
      } catch (error) {
        lastError = error;
        if (!this.isConnectivityError(error) || attempt >= this.maxConnectivityRetries) {
          throw this.toHttpClientError(error, requestUrl);
        }
        await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
      }
    }

    throw this.toHttpClientError(lastError, requestUrl);
  }

  private toUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    if (!this.baseUrl) {
      return path.startsWith("/") ? path : `/${path}`;
    }
    const normalizedBase = this.baseUrl.replace(/\/$/, "");
    if (path.startsWith("?")) {
      return `${normalizedBase}${path}`;
    }
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  private toAxiosConfig(path: string, init: RequestInit): AxiosRequestConfig {
    const method = init.method ?? "GET";
    return {
      url: path,
      method,
      headers: {
        ...this.defaultHeaders,
        ...normalizeHeaders(init.headers),
      },
      data: init.body,
      signal: init.signal ?? undefined,
    };
  }

  private isConnectivityError(error: unknown): boolean {
    return axios.isAxiosError(error) && !error.response;
  }

  private toHttpClientError(error: unknown, requestUrl: string): HttpClientError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      if (status === 0) {
        const message =
          this.connectivityErrorMessage?.(requestUrl) ??
          `Cannot connect to ${requestUrl}`;
        return new HttpClientError(message, 0, error, requestUrl);
      }
      const responseMessage =
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String((error.response.data as { message: unknown }).message)
          : error.message;
      return new HttpClientError(
        responseMessage || `HTTP request failed with status ${status}`,
        status,
        error.response?.data ?? error,
        requestUrl,
      );
    }
    if (error instanceof Error) {
      return new HttpClientError(error.message, 0, error, requestUrl);
    }
    return new HttpClientError(`Cannot connect to ${requestUrl}`, 0, error, requestUrl);
  }
}
