import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRete } from "rete-react-plugin";
import { BacktestRunButton } from "@/components/BacktestRunButton";
import { PaperTradePanel } from "@/components/PaperTradePanel";
import { TradingViewPanel } from "@/components/TradingViewPanel";
import { createEditor } from "@/lib/rete";
import type { EditorHandle } from "@/lib/rete";
import type { BacktestResult } from "@/types";
import type { SupportedSymbol } from "shared";

export function BuilderPage() {
  const [ref, editorHandle] = useRete<EditorHandle>(createEditor);
  const [symbol, setSymbol] = useState<SupportedSymbol>("AAPL");
  const [panelWidth, setPanelWidth] = useState(500);
  const [chartHeight, setChartHeight] = useState(360);
  const [backtest, setBacktest] = useState<BacktestResult | null>(null);
  const [backtestError, setBacktestError] = useState<string | null>(null);
  const dragState = useRef<{
    resizingWidth: boolean;
    resizingHeight: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>({
    resizingWidth: false,
    resizingHeight: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (dragState.current.resizingWidth) {
        const next =
          dragState.current.startWidth -
          (event.clientX - dragState.current.startX);
        setPanelWidth(Math.min(860, Math.max(360, next)));
      }
      if (dragState.current.resizingHeight) {
        const next =
          dragState.current.startHeight +
          (event.clientY - dragState.current.startY);
        setChartHeight(Math.min(720, Math.max(220, next)));
      }
    }
    function onUp() {
      dragState.current.resizingWidth = false;
      dragState.current.resizingHeight = false;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      className="App"
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          background: "rgba(11, 11, 16, 0.96)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 0.2 }}>
            Block Strategy
          </span>
          <Link
            to="/admin"
            style={{
              color: "#9ad5ff",
              textDecoration: "none",
              fontSize: 12,
              border: "1px solid rgba(154, 213, 255, 0.4)",
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            Admin
          </Link>
        </div>
        <div style={{ opacity: 0.7, fontSize: 12 }}>{symbol}</div>
      </header>

      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <div ref={ref} style={{ height: "100%", width: "100%" }}></div>
          <BacktestRunButton
            symbol={symbol}
            editorHandle={editorHandle}
            onSuccess={(result) => {
              setBacktest(result);
              setBacktestError(null);
            }}
            onError={setBacktestError}
          />
        </div>
        <div
          style={{
            width: panelWidth,
            minWidth: 360,
            maxWidth: 860,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "rgba(9, 9, 12, 0.95)",
            borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
            position: "relative",
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div
            style={{
              position: "absolute",
              left: -6,
              top: 0,
              width: 12,
              height: "100%",
              cursor: "ew-resize",
              zIndex: 5,
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              dragState.current.resizingWidth = true;
              dragState.current.startX = event.clientX;
              dragState.current.startWidth = panelWidth;
            }}
          />
          <div style={{ height: chartHeight, minHeight: 220 }}>
            <TradingViewPanel symbol={symbol} />
          </div>
          <div
            style={{
              height: 10,
              cursor: "ns-resize",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 6,
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              dragState.current.resizingHeight = true;
              dragState.current.startY = event.clientY;
              dragState.current.startHeight = chartHeight;
            }}
          />
          <div style={{ flex: 1, minHeight: 260 }}>
            <PaperTradePanel
              symbol={symbol}
              onSymbolChange={setSymbol}
              backtest={backtest}
              backtestError={backtestError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
