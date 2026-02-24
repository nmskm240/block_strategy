import type { StrategyGraph } from "@server/domain/strategyGraph";
import { DataFrame } from "data-forge";
import { analyze, backtest, computeEquityCurve, type IBar } from "grademark";
import { TradeDirection, type IStrategy } from "grademark/build/lib/strategy";
import type { BacktestEnvironment, BacktestResult, OHLCV } from "shared";
import { compileSignals, type StrategySignalBar } from "./strategyCompiler";
import type { OhlcvFetcher } from "@server/application/ports/ohlcvFetcher";

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
  private _ohlcvFetcher: OhlcvFetcher;

  constructor(ohlcvFetcher: OhlcvFetcher) {
    this._ohlcvFetcher = ohlcvFetcher;
  }

  async run(
    graph: StrategyGraph,
    environment: BacktestEnvironment,
  ): Promise<BacktestResult> {
    const ohlcvs = await this._ohlcvFetcher.fetchOhlcvs(
      environment.symbol,
      environment.timeframe,
      environment.testRange,
    );
    const sourceDf = new DataFrame<number, OHLCV>(ohlcvs);
    const withSignals = compileSignals(graph, sourceDf);
    console.log(
      "Compiled strategy with signals:",
      withSignals.filter((bar) => bar.entrySignal || bar.exitSignal).toArray(),
    );
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
