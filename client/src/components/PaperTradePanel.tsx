import type { BacktestResult } from "@/types";
import { SUPPORTED_SYMBOLS, type SupportedSymbol } from "shared";

type PaperTradePanelProps = {
  symbol: SupportedSymbol;
  onSymbolChange: (value: SupportedSymbol) => void;
  backtest: BacktestResult | null;
  backtestError: string | null;
};

export function PaperTradePanel({
  symbol,
  onSymbolChange,
  backtest,
  backtestError,
}: PaperTradePanelProps) {
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
        <span style={{ opacity: 0.6 }}>·</span>
        <select
          value={symbol}
          onChange={(event) =>
            onSymbolChange(event.target.value as SupportedSymbol)
          }
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            color: "#fff",
            fontSize: 12,
            padding: "2px 6px",
            width: 180,
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {SUPPORTED_SYMBOLS.map((item) => (
            <option key={item} value={item} style={{ color: "#111" }}>
              {item}
            </option>
          ))}
        </select>
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
            gap: 6,
          }}
        >
          {!backtest ? (
            <div style={{ opacity: 0.6 }}>No backtest yet</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>Equity</span>
                <span>${backtest.finalEquity.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>PnL</span>
                <span style={{ color: backtest.pnl >= 0 ? "#8ee4b1" : "#ff8b8b" }}>
                  ${backtest.pnl.toFixed(2)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>Position</span>
                <span>{backtest.finalPosition}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>Last Price</span>
                <span>${backtest.lastPrice.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
