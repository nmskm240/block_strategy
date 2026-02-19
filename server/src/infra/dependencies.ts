import { BacktestService } from "@server/application/services/backtestService";
import { Dependency } from "hono-simple-di";
import { DummyOhlcvRepository } from "./repositories";

export const ohlcvRepositoryDep = new Dependency(
  () => new DummyOhlcvRepository(),
);

export const backtestServiceDep = new Dependency(async (c) => {
  const repository = await ohlcvRepositoryDep.resolve(c);
  return new BacktestService(repository);
});
