import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRete } from "rete-react-plugin";
import { BacktestRunButton } from "@/components/BacktestRunButton";
import { BacktestResultsPanel } from "@/components/BacktestResultsPanel";
import { BuilderTutorialTour } from "@/components/BuilderTutorialTour";
import { createEditor } from "@/lib/rete";
import type { EditorHandle } from "@/lib/rete";
import type { BacktestHistoryItem } from "@/types";
import type { SupportedSymbol } from "shared";

export function BuilderPage() {
  const [ref, editorHandle] = useRete<EditorHandle>(createEditor);
  const [symbol, setSymbol] = useState<SupportedSymbol>("AAPL");
  const [isTutorialRunning, setIsTutorialRunning] = useState(false);
  const [backtests, setBacktests] = useState<BacktestHistoryItem[]>([]);
  const [backtestError, setBacktestError] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = "builder-tutorial-seen-v1";
    if (window.localStorage.getItem(storageKey) === "1") {
      return;
    }
    window.localStorage.setItem(storageKey, "1");
    setIsTutorialRunning(true);
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsTutorialRunning(true)}
            style={{
              color: "#cde6ff",
              background: "transparent",
              border: "1px solid rgba(205, 230, 255, 0.45)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            チュートリアル再生
          </button>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <div
          style={{ flex: 1, minWidth: 0, position: "relative" }}
          data-tour="editor-canvas"
        >
          <div ref={ref} style={{ height: "100%", width: "100%" }}></div>
          <BacktestRunButton
            symbol={symbol}
            onSymbolChange={setSymbol}
            editorHandle={editorHandle}
            onSuccess={({ result, symbol: runSymbol, since, until }) => {
              setBacktests((current) => [
                {
                  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                  symbol: runSymbol,
                  ranAt: new Date().toISOString(),
                  since: since.toISOString(),
                  until: until.toISOString(),
                  result,
                },
                ...current,
              ]);
              setBacktestError(null);
            }}
            onError={setBacktestError}
          />
        </div>
        <div
          style={{
            width: 500,
            minWidth: 500,
            maxWidth: 500,
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
          <div style={{ flex: 1, minHeight: 260 }}>
            <BacktestResultsPanel
              backtests={backtests}
              backtestError={backtestError}
            />
          </div>
        </div>
      </div>
      <BuilderTutorialTour
        run={isTutorialRunning}
        onStop={() => setIsTutorialRunning(false)}
      />
    </div>
  );
}
