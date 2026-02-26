import { BacktestService } from "@server/application/services/backtestService";
import { TwelveDataFetcher } from "@server/infra/externalApis";
import { Dependency } from "hono-simple-di";
import { DummyOhlcvRepository } from "./repositories";
import type { WorkerBindings } from "./bindings";

function getBindings(input: unknown): WorkerBindings {
  if (typeof input === "object" && input !== null && "env" in input) {
    return (input as { env: WorkerBindings }).env;
  }
  return {};
}

export const ohlcvRepositoryDep = new Dependency(() => new DummyOhlcvRepository());

export const backtestServiceDep = new Dependency(async (c) => {
  const twelveDataFetcher = await twelveDataFetcherDep.resolve(c);
  if (!twelveDataFetcher) {
    return null;
  }
  return new BacktestService(twelveDataFetcher);
});

export const twelveDataFetcherDep = new Dependency((c) => {
  const env = getBindings(c);
  if (!env.TWELVE_DATA_API_KEY) {
    return null;
  }
  return new TwelveDataFetcher({
    apiKey: env.TWELVE_DATA_API_KEY,
    baseUrl: env.TWELVE_DATA_BASE_URL ?? "https://api.twelvedata.com",
  });
});
