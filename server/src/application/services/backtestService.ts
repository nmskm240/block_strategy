import type { StrategyGraph } from "@server/domain/strategyGraph";
import { DataFrame } from "data-forge";
import { analyze, backtest, computeEquityCurve, type IBar } from "grademark";
import { TradeDirection, type IStrategy } from "grademark/build/lib/strategy";
import type { BacktestEnvironment, BacktestResult, OHLCV } from "shared";
import { compileSignals, type StrategySignalBar } from "./strategyCompiler";
import { resampleOhlcvs, type IOhlcvRepository } from "@server/domain/ohlcv";

const StrategyTemplate: IStrategy<StrategySignalBar> = {
  entryRule: (enterPosition, args) => {
    if (args.bar.entrySignal) {
      enterPosition({
        direction:
          args.bar.entryDirection < 0
            ? TradeDirection.Short
            : TradeDirection.Long,
      });
    }
  },
  exitRule: (exitPosition, args) => {
    if (args.bar.exitSignal) {
      exitPosition();
    }
  },
};

export class BacktestService {
  private _repository: IOhlcvRepository;

  constructor(repository: IOhlcvRepository) {
    this._repository = repository;
  }

  async run(
    graph: StrategyGraph,
    environment: BacktestEnvironment,
  ): Promise<BacktestResult> {
    const ohlcvs = await this._repository.getOhlcvs(
      environment.symbol,
      environment.testRange,
    );
    const sourceDf = new DataFrame<number, OHLCV>(
      resampleOhlcvs(ohlcvs, environment.timeframe),
    );
    const withSignals = compileSignals(graph, sourceDf);
    const trades = backtest(StrategyTemplate, withSignals);
    const analysis = analyze(environment.cash, trades);
    const equityCurve = computeEquityCurve(environment.cash, trades);

    return {
      environment,
      trades,
      analysis,
      equityCurve,
    };
  }
}
