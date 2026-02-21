import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { AdminApiClient } from "@/services/adminClient";
import { OhlcvLightweightChart } from "@/components/OhlcvLightweightChart";
import type { OHLCV } from "shared";

const cardStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 14,
  padding: 16,
};

export function AdminPage() {
  const api = useMemo(() => new AdminApiClient(), []);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [rows, setRows] = useState<OHLCV[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  async function onSeedClick() {
    setSeedLoading(true);
    setSeedError(null);
    setSeedResult(null);
    try {
      const result = await api.seedOhlcv({ symbol: "NASDAQ:AAPL", days: 14 });
      setSeedResult(
        `${result.symbol}: ${result.insertedCount}件を投入 (${result.since} - ${result.until})`,
      );
      await refreshFiles();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSeedError(message);
    } finally {
      setSeedLoading(false);
    }
  }

  async function refreshFiles() {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setFilesError(message);
    } finally {
      setFilesLoading(false);
    }
  }

  async function loadSelectedFile() {
    if (!selectedFile) return;
    setContentLoading(true);
    setContentError(null);
    try {
      const content = await api.getOhlcvFileContent(selectedFile);
      setRows(content.ohlcvs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setContentError(message);
    } finally {
      setContentLoading(false);
    }
  }

  useEffect(() => {
    void refreshFiles();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 0% 0%, #1d2d48 0%, #111620 45%, #090b10 100%)",
        color: "#f5f7fb",
        fontFamily:
          '"Avenir Next", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
      }}
    >
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          background: "rgba(8, 11, 17, 0.72)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ fontWeight: 700, letterSpacing: 0.3 }}>
          Block Strategy Admin
        </div>
        <Link
          to="/"
          style={{
            color: "#9ad5ff",
            textDecoration: "none",
            border: "1px solid rgba(154, 213, 255, 0.35)",
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 13,
          }}
        >
          Builderへ戻る
        </Link>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>管理画面</h1>
        <p style={{ opacity: 0.78, marginBottom: 16 }}>
          OHLCVデータ運用とバックエンド状態を確認するためのルートです。
        </p>

        <section style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <article style={cardStyle}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Data Import</h2>
            <p style={{ opacity: 0.8, margin: "8px 0 12px" }}>
              テスト用OHLCVをR2バケットへ投入できます。
            </p>
            <button
              type="button"
              onClick={onSeedClick}
              disabled={seedLoading}
              style={{
                background: "#2f78ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: seedLoading ? "not-allowed" : "pointer",
                opacity: seedLoading ? 0.7 : 1,
              }}
            >
              {seedLoading ? "投入中..." : "テストOHLCVを投入"}
            </button>
            {seedResult && (
              <p style={{ marginTop: 10, color: "#9df5bf", fontSize: 13 }}>
                {seedResult}
              </p>
            )}
            {seedError && (
              <p style={{ marginTop: 10, color: "#ffb6b6", fontSize: 13 }}>
                {seedError}
              </p>
            )}
          </article>

          <article style={cardStyle}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Storage Browser</h2>
            <p style={{ opacity: 0.8, margin: "8px 0 12px" }}>
              バケット内ファイルを選んでOHLCVを表示できます。
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={selectedFile}
                onChange={(event) => setSelectedFile(event.target.value)}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: "rgba(0,0,0,0.35)",
                  color: "#f5f7fb",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                {files.length === 0 && <option value="">ファイルなし</option>}
                {files.map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={refreshFiles}
                disabled={filesLoading}
                style={{
                  background: "#1f3552",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor: filesLoading ? "not-allowed" : "pointer",
                }}
              >
                更新
              </button>
              <button
                type="button"
                onClick={loadSelectedFile}
                disabled={!selectedFile || contentLoading}
                style={{
                  background: "#2f78ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor:
                    !selectedFile || contentLoading ? "not-allowed" : "pointer",
                  opacity: !selectedFile || contentLoading ? 0.7 : 1,
                }}
              >
                {contentLoading ? "読込中..." : "表示"}
              </button>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 10 }}>
              bucket: `OHLCV_BUCKET`
            </div>
            {filesError && (
              <p style={{ marginTop: 10, color: "#ffb6b6", fontSize: 13 }}>
                {filesError}
              </p>
            )}
            {contentError && (
              <p style={{ marginTop: 10, color: "#ffb6b6", fontSize: 13 }}>
                {contentError}
              </p>
            )}
          </article>
        </section>

        <section style={{ ...cardStyle, marginTop: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>OHLCV Chart</h2>
          <p style={{ opacity: 0.8, margin: "8px 0 12px" }}>
            選択中ファイル: {selectedFile || "なし"} / データ件数: {rows.length}
          </p>
          <OhlcvLightweightChart rows={rows} />
        </section>
      </main>
    </div>
  );
}
