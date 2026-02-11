export class ApiClientError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export type ApiClientOptions = {
  baseUrl?: string;
};

export class ApiClient {
  private baseUrl: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";
  }

  async post<TBody>(path: string, body: TBody): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new ApiClientError(
        `Cannot connect to API server at ${this.baseUrl}. Is the server running?`,
        0,
        error,
      );
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? String(payload.message)
          : `API request failed with status ${response.status}`;
      throw new ApiClientError(message, response.status, payload);
    }

    return payload;
  }
}
