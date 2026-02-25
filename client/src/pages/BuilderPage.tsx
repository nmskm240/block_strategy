import { BuilderTutorialTour } from "@/components/BuilderTutorialTour";
import { MobileNodeAddFab } from "@/features/addNode/components/MobileNodeAddFab";
import { BacktestRunButton } from "@/features/runBacktest/components/BacktestRunButton";
import { BacktestResultsPanel } from "@/features/showBacktestResult/components/BacktestResultsPanel";
import type { EditorHandle } from "@/lib/rete";
import { createEditor } from "@/lib/rete";
import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useRete } from "rete-react-plugin";
import type { BacktestResult } from "shared";

export function BuilderPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
      <div
        style={{
          height: "94.5dvh",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <div
          style={{ flex: 1, position: "relative", minHeight: 0 }}
          data-tour="editor-canvas"
        >
          <div ref={ref} style={{ height: "100%", width: "100%" }} />
          <BacktestRunButton
            editorHandle={editorHandle!}
            onRunSuccess={(item) => {
              setBacktests((current) => [item, ...current]);
            }}
          />
          {isMobile && <MobileNodeAddFab editorHandle={editorHandle ?? undefined} />}
        </div>
        <div
          style={{
            flex: isMobile ? "0 0 auto" : 1,
            minHeight: isMobile ? undefined : "100%",
            overflowY: "auto",
            maxWidth: isMobile ? "100%" : "60dvh",
            width: isMobile ? "100%" : undefined,
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
