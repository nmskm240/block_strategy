import { BuilderTutorialTour } from "@/components/BuilderTutorialTour";
import { BacktestRunButton } from "@/features/runBacktest/components/BacktestRunButton";
import { BacktestResultsPanel } from "@/features/showBacktestResult/components/BacktestResultsPanel";
import type { EditorHandle } from "@/lib/rete";
import { createEditor } from "@/lib/rete";
import { useEffect, useState } from "react";
import { useRete } from "rete-react-plugin";
import type { BacktestResult } from "shared";

export function BuilderPage() {
  const [ref, editorHandle] = useRete<EditorHandle>(createEditor);
  const [isTutorialRunning, setIsTutorialRunning] = useState(false);
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);

  useEffect(() => {
    const storageKey = "builder-tutorial-seen-v1";
    if (window.localStorage.getItem(storageKey) === "1") {
      return;
    }
    window.localStorage.setItem(storageKey, "1");
    setIsTutorialRunning(true);
  }, []);

  return (
    <>
      <div style={{ height: "94.5dvh", display: "flex" }}>
        <div
          style={{ flex: 1, position: "relative" }}
          data-tour="editor-canvas"
        >
          <div ref={ref} style={{ height: "100%", width: "100%" }} />
          <BacktestRunButton
            editorHandle={editorHandle!}
            onRunSuccess={(item) => {
              setBacktests((current) => [item, ...current]);
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            minHeight: "100%",
            overflowY: "auto",
            maxWidth: "60dvh",
          }}
        >
          <BacktestResultsPanel backtests={backtests} />
        </div>
      </div>
      <BuilderTutorialTour
        run={isTutorialRunning}
        onStop={() => setIsTutorialRunning(false)}
      />
    </>
  );
}
