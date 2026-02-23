import { useBacktestRunner } from "@/hooks/useBacktestRunner";
import type { EditorHandle } from "@/lib/rete";
import { useState } from "react";
import type {
  BacktestResult,
  DateRange,
  SupportedSymbol,
  Timeframe,
} from "shared";

type Props = {
  editorHandle: EditorHandle;
  onRunSuccess: (item: BacktestResult) => void;
  onRunError: (message: string) => void;
};

export function useBacktestRunDialogViewModel({
  editorHandle,
  onRunSuccess,
  onRunError,
}: Props) {
  const [symbol, setSymbol] = useState<SupportedSymbol>("AAPL");
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  const [range, setRange] = useState<DateRange>({
    since: new Date("2020-01-01"),
    until: new Date("2023-12-31"),
  });
  const runner = useBacktestRunner();

  async function onRunBacktest() {
    const graph = editorHandle.getGraph();
    try {
      const result = await runner.run(graph, {
        symbol,
        testRange: range,
        timeframe,
        cash: 1_000_000,
      });
      onRunSuccess(result);
    } catch (error) {
      onRunError(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    symbol,
    timeframe,
    range,
    setSymbol,
    setTimeframe,
    setRange,
    onRunBacktest,
  };
}
