import type { StrategyGraph } from "@server/domain/strategyGraph";
import { DataFrame } from "data-forge";
import { analyze, backtest, type IBar } from "grademark";
import { TradeDirection, type IStrategy } from "grademark/build/lib/strategy";
import type { BacktestResult, OHLCV, Timeframe } from "shared";
import { compileSignals, type StrategySignalBar } from "./strategyCompiler";
import type { DateRange } from "@server/domain/dateRange";
import { resampleOhlcvs, type IOhlcvRepository } from "@server/domain/ohlcv";

type BacktestEnviroment = {
  symbol: string;
  timeframe: Timeframe;
  testRange: DateRange;
  cash: number;
};

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
    enviroment: BacktestEnviroment,
  ): Promise<BacktestResult> {
    const ohlcvs = await this._repository.getOhlcvs(
      enviroment.symbol,
      enviroment.testRange,
    );
    const sourceDf = new DataFrame<number, OHLCV>(
      resampleOhlcvs(ohlcvs, enviroment.timeframe),
    );
    const withSignals = compileSignals(graph, sourceDf);
    const trades = backtest(StrategyTemplate, withSignals);
    const analysis = analyze(enviroment.cash, trades);
    const lastPrice = ohlcvs[ohlcvs.length - 1]?.close ?? 0;

    return {
      trades: trades.flatMap((trade) => {
        const entrySide =
          trade.direction === TradeDirection.Short ? "SELL" : "BUY";
        const exitSide = entrySide === "BUY" ? "SELL" : "BUY";
        return [
          {
            side: entrySide,
            price: trade.entryPrice,
            time: trade.entryTime.toISOString(),
          },
          {
            side: exitSide,
            price: trade.exitPrice,
            time: trade.exitTime.toISOString(),
          },
        ];
      }),
      startCash: enviroment.cash,
      finalCash: analysis.finalCapital,
      finalPosition: 0,
      finalEquity: analysis.finalCapital,
      pnl: analysis.profit,
      lastPrice,
    };
  }
}
