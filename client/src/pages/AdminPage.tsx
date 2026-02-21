import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { useState } from "react";
import { AdminApiClient } from "@/services/adminClient";

const cardStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 14,
  padding: 16,
};

export function AdminPage() {
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  async function onSeedClick() {
    setSeedLoading(true);
    setSeedError(null);
    setSeedResult(null);
    try {
      const api = new AdminApiClient();
      const result = await api.seedOhlcv({ symbol: "NASDAQ:AAPL", days: 14 });
      setSeedResult(
        `${result.symbol}: ${result.insertedCount}件を投入 (${result.since} - ${result.until})`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSeedError(message);
    } finally {
      setSeedLoading(false);
    }
  }

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
            <h2 style={{ margin: 0, fontSize: 16 }}>Storage Status</h2>
            <p style={{ opacity: 0.8, margin: "8px 0 12px" }}>
              R2バケット利用状況の表示領域です。
            </p>
            <div style={{ fontSize: 13, opacity: 0.7 }}>bucket: `OHLCV_BUCKET`</div>
          </article>
        </section>
      </main>
    </div>
  );
}
