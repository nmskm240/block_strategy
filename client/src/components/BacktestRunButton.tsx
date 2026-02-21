import { Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DateRangePicker } from "@/components/DateRangePicker";
import type { EditorHandle } from "@/lib/rete";
import { useBacktestRunner } from "@/hooks/useBacktestRunner";
import type { BacktestRunSuccessPayload } from "@/types";
import {
  SUPPORTED_SYMBOLS,
  type DateRange,
  type SupportedSymbol,
} from "shared";
import "@/styles/components/backtestRunButton.css";

type BacktestRunButtonProps = {
  symbol: SupportedSymbol;
  onSymbolChange: (value: SupportedSymbol) => void;
  editorHandle: EditorHandle | null;
  onSuccess: (payload: BacktestRunSuccessPayload) => void;
  onError: (message: string) => void;
};

export function BacktestRunButton({
  symbol,
  onSymbolChange,
  editorHandle,
  onSuccess,
  onError,
}: BacktestRunButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSymbol, setFormSymbol] = useState<SupportedSymbol>(symbol);
  const [range, setRange] = useState<DateRange>({
    since: new Date(),
    until: new Date(),
  });
  const { isRunning, canRun, runBacktest } = useBacktestRunner({
    editorHandle,
    onSuccess,
    onError,
  });
  const disabled = !canRun || isRunning;

  const defaultRange = useMemo(() => {
    const until = new Date();
    const since = new Date(until.getTime() - 60 * 60 * 1000 * 60);
    return { since, until };
  }, []);

  useEffect(() => {
    setFormSymbol(symbol);
  }, [symbol]);

  function openModal() {
    setFormSymbol(symbol);
    setRange(defaultRange);
    setIsModalOpen(true);
  }

  async function onSubmit() {
    const since = new Date(range.since);
    const until = new Date(range.until);
    since.setHours(0, 0, 0, 0);
    until.setHours(23, 59, 59, 999);
    if (Number.isNaN(since.getTime()) || Number.isNaN(until.getTime())) {
      onError("日付の形式が不正です");
      return;
    }
    if (since >= until) {
      onError("開始日時は終了日時より前にしてください");
      return;
    }
    onSymbolChange(formSymbol);
    setIsModalOpen(false);
    await runBacktest({ symbol: formSymbol, since, until });
  }

  return (
    <>
      <button
        type="button"
        data-tour="backtest-run-button"
        aria-label={isRunning ? "Backtesting..." : "Run Backtest"}
        title={isRunning ? "Backtesting..." : "Run Backtest"}
        onClick={openModal}
        onPointerDown={(event) => event.stopPropagation()}
        disabled={disabled}
        className="backtest-run-button"
      >
        <Play size={18} />
      </button>

      {isModalOpen && (
        <div className="backtest-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="backtest-modal"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <h3 className="backtest-modal-title">バックテスト設定</h3>
            <label className="backtest-modal-label" htmlFor="backtest-symbol">
              銘柄
            </label>
            <select
              id="backtest-symbol"
              className="backtest-modal-input"
              value={formSymbol}
              onChange={(event) =>
                setFormSymbol(event.target.value as SupportedSymbol)
              }
            >
              {SUPPORTED_SYMBOLS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="backtest-modal-label" htmlFor="backtest-since">
              バックテスト期間
            </label>
            <DateRangePicker value={range} onChange={setRange} />

            <div className="backtest-modal-actions">
              <button
                type="button"
                className="backtest-modal-cancel"
                onClick={() => setIsModalOpen(false)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="backtest-modal-submit"
                onClick={onSubmit}
                disabled={isRunning}
              >
                {isRunning ? "実行中..." : "実行"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
