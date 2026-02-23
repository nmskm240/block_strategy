import {
  HttpClient,
  Timeframe,
  type DateRange,
  type OHLCV,
  type SupportedSymbol,
} from "shared";

type TwelveDataTimeSeriesResponse = {
  status?: string;
  values?: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: string;
  }>;
  message?: string;
};

type TwelveDataClientOptions = {
  apiKey: string;
  baseUrl: string;
};

export class TwelveDataClient {
  private readonly apiKey: string;
  private readonly http: HttpClient;

  constructor(options: TwelveDataClientOptions) {
    this.apiKey = options.apiKey;
    this.http = new HttpClient({
      baseUrl: options.baseUrl,
      connectivityErrorMessage: (requestUrl) =>
        `Cannot connect to TwelveData at ${requestUrl}`,
    });
  }

  async fetchOhlcvs(
    symbol: SupportedSymbol,
    timeframe: Timeframe,
    range: DateRange,
  ): Promise<OHLCV[]> {
    const params = new URLSearchParams();
    params.set("symbol", symbol);
    params.set("interval", timeframe);
    params.set(
      "start_date",
      range.since.toLocaleDateString("en-CA", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    );
    params.set(
      "end_date",
      range.until.toLocaleDateString("en-CA", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    );
    params.set("timezone", "UTC");
    params.set("order", "ASC");
    params.set("format", "JSON");
    params.set("apikey", this.apiKey);

    const payload = (await this.http.get(
      `/time_series?${params.toString()}`,
    )) as TwelveDataTimeSeriesResponse;

    return (
      payload?.values
        ?.map((row) => ({
          timestamp: Date.parse(`${row.datetime}Z`),
          open: Number(row.open),
          high: Number(row.high),
          low: Number(row.low),
          close: Number(row.close),
          volume: Number(row.volume ?? "0"),
        }))
        .filter((row) =>
          Object.values(row).every((value) => Number.isFinite(value)),
        )
        .sort((a, b) => a.timestamp - b.timestamp) ?? []
    );
  }
}
