import { NodeAddFab } from "@/features/addNode/components/NodeAddFab";
import {
  loadBuilderDefaultGraphJson,
  shouldLoadDefaultBuilderGraph,
} from "@/features/builder/defaultStrategy";
import { BacktestRunButton } from "@/features/runBacktest/components/BacktestRunButton";
import {
  ShareStrategyGraphAlerts,
  ShareStrategyGraphHeaderButton,
  useShareStrategyGraph,
} from "@/features/shareStrategyGraph";
import { BacktestResultsPanel } from "@/features/showBacktestResult/components/BacktestResultsPanel";
import type { EditorHandle } from "@/lib/rete";
import { createEditor } from "@/lib/rete";
import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { useRete } from "rete-react-plugin";
import type { BacktestResult } from "shared";
import type { LayoutOutletContext } from "@/components/Layout";

export function BuilderPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const { setHeaderRightContent } = useOutletContext<LayoutOutletContext>();
  const [ref, editorHandle] = useRete<EditorHandle>(createEditor);
  const [isTutorialRunning, setIsTutorialRunning] = useState(false);
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const hasAppliedInitialRouteGraphRef = useRef(false);
  const {
    urlImportError,
    exportStatus,
    clearUrlImportError,
    clearExportStatus,
    exportShareUrl,
  } = useShareStrategyGraph(editorHandle);

  useEffect(() => {
    const storageKey = "builder-tutorial-seen-v1";
    if (window.localStorage.getItem(storageKey) === "1") {
      return;
    }
    window.localStorage.setItem(storageKey, "1");
    setIsTutorialRunning(true);
  }, []);

  useEffect(() => {
    setHeaderRightContent(
      <ShareStrategyGraphHeaderButton
        onClick={() => void exportShareUrl()}
        disabled={!editorHandle}
      />,
    );

    return () => {
      setHeaderRightContent(null);
    };
  }, [editorHandle, exportShareUrl, setHeaderRightContent]);

  useEffect(() => {
    if (!editorHandle || hasAppliedInitialRouteGraphRef.current) {
      return;
    }

    if (!shouldLoadDefaultBuilderGraph(location.state)) {
      return;
    }

    if (new URLSearchParams(location.search).has("g")) {
      return;
    }

    hasAppliedInitialRouteGraphRef.current = true;

    void (async () => {
      if (editorHandle.getGraph().nodes.length > 0) {
        return;
      }
      const json = await loadBuilderDefaultGraphJson();
      await editorHandle.parseFromJson(json);
    })();
  }, [editorHandle, location.search, location.state]);

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
          <ShareStrategyGraphAlerts
            isMobile={isMobile}
            urlImportError={urlImportError}
            exportStatus={exportStatus}
            onCloseUrlImportError={clearUrlImportError}
            onCloseExportStatus={clearExportStatus}
          />
          <BacktestRunButton
            editorHandle={editorHandle!}
            onRunSuccess={(item) => {
              setBacktests((current) => [item, ...current]);
            }}
          />
          <NodeAddFab editorHandle={editorHandle ?? undefined} />
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
