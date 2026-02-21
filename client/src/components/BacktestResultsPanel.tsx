import { useEffect, useMemo, useState } from "react";
import { type UTCTimestamp } from "lightweight-charts";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import type { BacktestHistoryItem } from "@/types";

type BacktestResultsPanelProps = {
  backtests: BacktestHistoryItem[];
  backtestError: string | null;
};

export function BacktestResultsPanel({
  backtests,
  backtestError,
}: BacktestResultsPanelProps) {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  useEffect(() => {
    if (backtests.length === 0) {
      setSelectedResultId(null);
      return;
    }
    setSelectedResultId((current) => {
      if (!current) return backtests[0].id;
      return backtests.some((item) => item.id === current)
        ? current
        : backtests[0].id;
    });
  }, [backtests]);

  const selectedResult =
    backtests.find((item) => item.id === selectedResultId) ?? null;

  const formatDate = (value: string) => new Date(value).toLocaleDateString();

  const equityCurve = useMemo(() => {
    if (!selectedResult) return [];

    const sortedTrades = [...selectedResult.result.trades].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    let equity = selectedResult.result.startCash;
    const points: Array<{ time: UTCTimestamp; value: number }> = [];
    let prevTime = 0;
    let openTrade:
      | { side: "BUY" | "SELL"; price: number; time: string }
      | null = null;

    for (const trade of sortedTrades) {
      const rawSec = Math.floor(new Date(trade.time).getTime() / 1000);
      const sec = Number.isFinite(rawSec) ? rawSec : prevTime + 1;
      const time = (sec <= prevTime ? prevTime + 1 : sec) as UTCTimestamp;
      prevTime = time;

      if (!openTrade) {
        openTrade = {
          side: trade.side,
          price: trade.price,
          time: trade.time,
        };
        points.push({ time, value: equity });
        continue;
      }

      if (openTrade.side === trade.side) {
        openTrade = {
          side: trade.side,
          price: trade.price,
          time: trade.time,
        };
        points.push({ time, value: equity });
        continue;
      }

      const pnl =
        openTrade.side === "BUY"
          ? trade.price - openTrade.price
          : openTrade.price - trade.price;
      equity += pnl;
      openTrade = null;
      points.push({ time, value: equity });
    }

    return points;
  }, [selectedResult]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(12, 12, 16, 0.92)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 10,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
        overflow: "hidden",
        color: "#fff",
        fontSize: 12,
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          height: 34,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          background: "rgba(30, 30, 38, 0.9)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          userSelect: "none",
          gap: 8,
        }}
      >
        Backtest
      </div>

      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        {backtestError ? (
          <div
            style={{
              background: "rgba(162, 59, 59, 0.18)",
              border: "1px solid rgba(255, 120, 120, 0.5)",
              color: "#ffb3b3",
              borderRadius: 6,
              padding: 8,
              fontSize: 11,
            }}
          >
            {backtestError}
          </div>
        ) : null}

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 6,
            padding: 8,
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ opacity: 0.7, fontSize: 11 }}>Backtest Results</div>

          {backtests.length === 0 ? (
            <div style={{ opacity: 0.6 }}>No backtest yet</div>
          ) : (
            <select
              value={selectedResultId ?? ""}
              onChange={(event) => setSelectedResultId(event.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6,
                color: "#fff",
                fontSize: 12,
                padding: "6px 8px",
              }}
            >
              {backtests.map((item) => {
                const pnlLabel = `${item.result.pnl >= 0 ? "+" : ""}${item.result.pnl.toFixed(2)}`;
                return (
                  <option key={item.id} value={item.id} style={{ color: "#111" }}>
                    {`${item.symbol} | ${formatDate(item.since)} ~ ${formatDate(item.until)} | PnL ${pnlLabel}`}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {selectedResult ? (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 6,
              padding: 8,
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ opacity: 0.7, fontSize: 11 }}>Selected Result Detail</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.6 }}>Symbol</span>
              <span>{selectedResult.symbol}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.6 }}>Backtest Range</span>
              <span>
                {formatDate(selectedResult.since)} ~ {formatDate(selectedResult.until)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.6 }}>Equity</span>
              <span>${selectedResult.result.finalEquity.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.6 }}>PnL</span>
              <span
                style={{
                  color:
                    selectedResult.result.pnl >= 0 ? "#8ee4b1" : "#ff8b8b",
                }}
              >
                ${selectedResult.result.pnl.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.6 }}>Trades</span>
              <span>{selectedResult.result.trades.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.6 }}>Position</span>
              <span>{selectedResult.result.finalPosition}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.6 }}>Last Price</span>
              <span>${selectedResult.result.lastPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.6 }}>Executed At</span>
              <span>{new Date(selectedResult.ranAt).toLocaleString()}</span>
            </div>
            <div style={{ opacity: 0.7, fontSize: 11, marginTop: 4 }}>
              Equity Curve
            </div>
            <div
              style={{
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(8, 12, 18, 0.7)",
              }}
            >
              <EquityCurveChart points={equityCurve} />
            </div>
            <div style={{ opacity: 0.7, fontSize: 11, marginTop: 4 }}>
              Trades
            </div>
            <div
              style={{
                maxHeight: 120,
                overflowY: "auto",
                display: "grid",
                gap: 4,
              }}
            >
              {selectedResult.result.trades.length === 0 ? (
                <div style={{ opacity: 0.6 }}>No trades</div>
              ) : (
                selectedResult.result.trades.map((trade, index) => (
                  <div
                    key={`${trade.time}-${trade.side}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      padding: "3px 6px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <span
                      style={{
                        color: trade.side === "BUY" ? "#8ee4b1" : "#ffb3b3",
                        width: 38,
                      }}
                    >
                      {trade.side}
                    </span>
                    <span style={{ opacity: 0.75 }}>
                      {new Date(trade.time).toLocaleString()}
                    </span>
                    <span>${trade.price.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
