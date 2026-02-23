import { AdminApiClient } from "@/services/adminClient";
import { useCallback, useEffect, useState } from "react";
import type { OHLCV } from "shared";

export function useOhlcvFileBrowser() {
  const api = new AdminApiClient();
  const [files, setFiles] = useState<string[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [rows, setRows] = useState<OHLCV[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const refreshFiles = useCallback(async () => {
    setFilesLoading(true);
    setFilesError(null);
    try {
      const nextFiles = await api.listOhlcvFiles();
      setFiles(nextFiles);
      if (nextFiles.length > 0) {
        setSelectedFile((current) =>
          current && nextFiles.includes(current) ? current : nextFiles[0] ?? "",
        );
      } else {
        setSelectedFile("");
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setFilesError(message);
    } finally {
      setFilesLoading(false);
    }
  }, [api]);

  const loadSelectedFile = useCallback(async () => {
    if (!selectedFile) return;
    setContentLoading(true);
    setContentError(null);
    try {
      const content = await api.getOhlcvFileContent(selectedFile);
      setRows(content.ohlcvs);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setContentError(message);
    } finally {
      setContentLoading(false);
    }
  }, [api, selectedFile]);

  useEffect(() => {
    void refreshFiles();
  }, [refreshFiles]);

  return {
    files,
    filesLoading,
    filesError,
    selectedFile,
    setSelectedFile,
    rows,
    contentLoading,
    contentError,
    refreshFiles,
    loadSelectedFile,
  };
}
