import { BacktestService } from "@server/application/services/backtestService";
import { Dependency } from "hono-simple-di";
import { DummyOhlcvRepository, R2CsvOhlcvRepository } from "./repositories";
import type { WorkerBindings } from "./bindings";

function getBindings(input: unknown): WorkerBindings {
  if (typeof input === "object" && input !== null && "env" in input) {
    return (input as { env: WorkerBindings }).env;
  }
  return {};
}

export const ohlcvRepositoryDep = new Dependency((c) => {
  const env = getBindings(c);
  if (env.OHLCV_BUCKET) {
    return new R2CsvOhlcvRepository(env.OHLCV_BUCKET, env.OHLCV_OBJECT_PREFIX);
  }
  return new DummyOhlcvRepository();
});

export const backtestServiceDep = new Dependency(async (c) => {
  const repository = await ohlcvRepositoryDep.resolve(c);
  return new BacktestService(repository);
});
