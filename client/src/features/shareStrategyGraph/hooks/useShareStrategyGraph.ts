import type { EditorHandle } from "@/lib/rete";
import { useEffect, useRef, useState } from "react";
import { copyTextToClipboard } from "../copyTextToClipboard";
import {
  decompressJsonFromUrlParam,
  encodeJsonToLzUrlParam,
} from "../urlCodec";

export type ShareStrategyGraphStatus = {
  severity: "success" | "warning" | "error";
  message: string;
};

type UseShareStrategyGraphResult = {
  urlImportError: string | null;
  exportStatus: ShareStrategyGraphStatus | null;
  clearUrlImportError: () => void;
  clearExportStatus: () => void;
  exportShareUrl: () => Promise<void>;
};

export function useShareStrategyGraph(
  editorHandle: EditorHandle | null,
): UseShareStrategyGraphResult {
  const [urlImportError, setUrlImportError] = useState<string | null>(null);
  const [exportStatus, setExportStatus] =
    useState<ShareStrategyGraphStatus | null>(null);
  const hasTriedUrlImportRef = useRef(false);

  useEffect(() => {
    if (!editorHandle || hasTriedUrlImportRef.current) {
      return;
    }
    hasTriedUrlImportRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("g");
    if (!encoded) {
      return;
    }

    void (async () => {
      try {
        const json = await decompressJsonFromUrlParam(encoded);
        await editorHandle.parseFromJson(json);
        setUrlImportError(null);
      } catch (error) {
        setUrlImportError(
          error instanceof Error
            ? `URL graph import failed: ${error.message}`
            : "URL graph import failed.",
        );
      }
    })();
  }, [editorHandle]);

  const exportShareUrl = async () => {
    if (!editorHandle) return;

    setExportStatus(null);
    try {
      const graph = editorHandle.getGraph();
      const exportedJson = JSON.stringify(graph);
      const compressed = encodeJsonToLzUrlParam(exportedJson);
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set("g", compressed);
      await copyTextToClipboard(url.toString());
      setExportStatus({ severity: "success", message: "Copied share URL." });
    } catch (error) {
      setExportStatus({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to export share URL.",
      });
    }
  };

  return {
    urlImportError,
    exportStatus,
    clearUrlImportError: () => setUrlImportError(null),
    clearExportStatus: () => setExportStatus(null),
    exportShareUrl,
  };
}
