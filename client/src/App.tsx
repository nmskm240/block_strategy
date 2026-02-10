import { useEffect, useRef, useState } from "react";
import { useRete } from "rete-react-plugin";
import { createEditor, type EditorApi } from "./editor";
import { PaperTradePanel } from "./components/PaperTradePanel";
import { Toolbox } from "./components/Toolbox";
import { TradingViewPanel } from "./components/TradingViewPanel";
import { runBacktestFromGraph } from "./services/backtest";

function App() {
  const [ref, editor] = useRete<EditorApi>(createEditor);
  const [symbol, setSymbol] = useState("NASDAQ:AAPL");
  const canRunBacktest = Boolean(editor);
  const [panelWidth, setPanelWidth] = useState(420);
  const [chartHeight, setChartHeight] = useState(360);
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
        setPanelWidth(Math.min(720, Math.max(320, next)));
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
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <div ref={ref} style={{ height: "100%", width: "100%" }}></div>
        <Toolbox editor={editor} />
      </div>
      <div
        style={{
          width: panelWidth,
          minWidth: 320,
          maxWidth: 720,
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
            canRunBacktest={canRunBacktest}
            onRunBacktest={() => {
              if (!editor) return null;
              const snapshot = editor.getGraph();
              return runBacktestFromGraph(snapshot, symbol);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
