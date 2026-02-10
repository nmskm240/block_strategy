import { useEffect, useMemo, useState } from "react";
import type { BacktestResult, Trade } from "../types/trading";

type PaperTradePanelProps = {
  symbol: string;
  onSymbolChange: (value: string) => void;
  onRunBacktest: () => BacktestResult | null;
  canRunBacktest: boolean;
};

export function PaperTradePanel({
  symbol,
  onSymbolChange,
  onRunBacktest,
  canRunBacktest,
}: PaperTradePanelProps) {
  const [price, setPrice] = useState(182.5);
  const [cash, setCash] = useState(10000);
  const [position, setPosition] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [size, setSize] = useState(1);
  const [backtest, setBacktest] = useState<BacktestResult | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPrice((prev) => {
        const delta = (Math.random() - 0.5) * 0.8;
        const next = Math.max(0.1, prev + delta);
        return Math.round(next * 100) / 100;
      });
    }, 800);
    return () => window.clearInterval(id);
  }, []);

  const equity = useMemo(() => cash + position * price, [cash, position, price]);
  const unrealized = useMemo(
    () => (position === 0 ? 0 : (price - avgPrice) * position),
    [position, price, avgPrice]
  );

  function marketBuy() {
    const cost = price * size;
    if (cash < cost) return;
    const newPosition = position + size;
    const newAvg =
      position === 0 ? price : (avgPrice * position + price * size) / newPosition;
    setCash((c) => c - cost);
    setPosition(newPosition);
    setAvgPrice(newAvg);
    setTrades((t) => [
      { side: "BUY", price, size, time: new Date().toLocaleTimeString() },
      ...t,
    ]);
  }

  function marketSell() {
    if (position <= 0) return;
    const sellSize = Math.min(size, position);
    const proceeds = price * sellSize;
    const newPosition = position - sellSize;
    setCash((c) => c + proceeds);
    setPosition(newPosition);
    if (newPosition === 0) setAvgPrice(0);
    setTrades((t) => [
      { side: "SELL", price, size: sellSize, time: new Date().toLocaleTimeString() },
      ...t,
    ]);
  }

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
        Paper Trade
        <span style={{ opacity: 0.6 }}>·</span>
        <input
          value={symbol}
          onChange={(event) => onSymbolChange(event.target.value)}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            color: "#fff",
            fontSize: 12,
            padding: "2px 6px",
            width: 120,
          }}
          onPointerDown={(event) => event.stopPropagation()}
        />
      </div>
      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ opacity: 0.7 }}>Last</span>
          <span style={{ fontSize: 16 }}>${price.toFixed(2)}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 8, borderRadius: 6 }}>
            <div style={{ opacity: 0.6 }}>Cash</div>
            <div>${cash.toFixed(2)}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 8, borderRadius: 6 }}>
            <div style={{ opacity: 0.6 }}>Equity</div>
            <div>${equity.toFixed(2)}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 8, borderRadius: 6 }}>
            <div style={{ opacity: 0.6 }}>Position</div>
            <div>{position}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 8, borderRadius: 6 }}>
            <div style={{ opacity: 0.6 }}>Avg Price</div>
            <div>${avgPrice ? avgPrice.toFixed(2) : "—"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 8, borderRadius: 6 }}>
            <div style={{ opacity: 0.6 }}>Unrealized</div>
            <div style={{ color: unrealized >= 0 ? "#8ee4b1" : "#ff8b8b" }}>
              ${unrealized.toFixed(2)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ opacity: 0.7 }}>Size</span>
          <input
            type="number"
            min={1}
            value={size}
            onChange={(event) => setSize(Math.max(1, Number(event.target.value)))}
            style={{
              width: 80,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              color: "#fff",
              fontSize: 12,
              padding: "2px 6px",
            }}
            onPointerDown={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            style={{
              background: "#2f8f6f",
              border: "1px solid #1d6f55",
              color: "#fff",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
            }}
            onClick={marketBuy}
          >
            Buy
          </button>
          <button
            type="button"
            style={{
              background: "#a23b3b",
              border: "1px solid #7f2c2c",
              color: "#fff",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
            }}
            onClick={marketSell}
          >
            Sell
          </button>
          <button
            type="button"
            style={{
              background: canRunBacktest ? "#3a4aa8" : "rgba(58, 74, 168, 0.5)",
              border: "1px solid #2c387f",
              color: "#fff",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: canRunBacktest ? "pointer" : "not-allowed",
            }}
            onClick={() => {
              if (!canRunBacktest) return;
              const result = onRunBacktest();
              if (result) setBacktest(result);
            }}
            disabled={!canRunBacktest}
          >
            Backtest
          </button>
        </div>
        <div style={{ opacity: 0.7, fontSize: 11 }}>Trades</div>
        <div
          style={{
            maxHeight: 160,
            overflow: "auto",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 6,
            padding: 8,
          }}
        >
          {trades.length === 0 ? (
            <div style={{ opacity: 0.6 }}>No trades yet</div>
          ) : (
            trades.map((t, i) => (
              <div key={`${t.time}-${i}`} style={{ display: "flex", gap: 8 }}>
                <span style={{ width: 40, color: t.side === "BUY" ? "#8ee4b1" : "#ff8b8b" }}>
                  {t.side}
                </span>
                <span style={{ width: 56 }}>${t.price.toFixed(2)}</span>
                <span style={{ width: 36 }}>x{t.size}</span>
                <span style={{ opacity: 0.6 }}>{t.time}</span>
              </div>
            ))
          )}
        </div>
        <div style={{ opacity: 0.7, fontSize: 11 }}>Backtest Result</div>
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
