import { Link } from "react-router-dom";
import { OhlcvLightweightChart } from "@/components/OhlcvLightweightChart";
import { useOhlcvFileBrowser } from "@/hooks/useOhlcvFileBrowser";
import { useSeedOhlcv } from "@/hooks/useSeedOhlcv";
import { useTwelveDataImport } from "@/hooks/useTwelveDataImport";
import "@/styles/pages/adminPage.css";

export function AdminPage() {
  const {
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
  } = useOhlcvFileBrowser();
  const { loading: seedLoading, result: seedResult, error: seedError, run: onSeedClick } =
    useSeedOhlcv({ onSuccess: refreshFiles });
  const {
    symbol: tdSymbol,
    setSymbol: setTdSymbol,
    date: tdDate,
    setDate: setTdDate,
    loading: tdLoading,
    result: tdResult,
    error: tdError,
    run: onImportTwelveDataClick,
  } = useTwelveDataImport({ onSuccess: refreshFiles });

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-title">Block Strategy Admin</div>
        <Link to="/" className="admin-back-link">
          Builderへ戻る
        </Link>
      </header>

      <main className="admin-main">
        <h1 className="admin-heading">管理画面</h1>
        <p className="admin-description">OHLCVデータ運用とバックエンド状態を確認するためのルートです。</p>

        <section className="admin-grid">
          <article className="admin-card">
            <h2 className="admin-card-title">Data Import</h2>
            <p className="admin-card-note">テスト用OHLCVをR2バケットへ投入できます。</p>
            <button
              type="button"
              onClick={onSeedClick}
              disabled={seedLoading}
              className={`admin-button admin-button-primary ${seedLoading ? "admin-button-disabled" : "admin-button-active"}`}
            >
              {seedLoading ? "投入中..." : "テストOHLCVを投入"}
            </button>
            {seedResult && <p className="admin-message-success">{seedResult}</p>}
            {seedError && <p className="admin-message-error">{seedError}</p>}
          </article>

          <article className="admin-card">
            <h2 className="admin-card-title">TwelveData Import</h2>
            <p className="admin-card-note">銘柄名と日付を指定して TwelveData API からOHLCVを取込みます。</p>
            <div className="admin-form-grid">
              <input
                value={tdSymbol}
                onChange={(event) => setTdSymbol(event.target.value)}
                placeholder="NASDAQ:AAPL"
                className="admin-field"
              />
              <input
                type="date"
                value={tdDate}
                onChange={(event) => setTdDate(event.target.value)}
                className="admin-field"
              />
            </div>
            <button
              type="button"
              onClick={onImportTwelveDataClick}
              disabled={tdLoading}
              className={`admin-button admin-button-success ${tdLoading ? "admin-button-disabled" : "admin-button-active"}`}
            >
              {tdLoading ? "取込中..." : "TwelveData実行"}
            </button>
            {tdResult && <p className="admin-message-success">{tdResult}</p>}
            {tdError && <p className="admin-message-error">{tdError}</p>}
          </article>

          <article className="admin-card">
            <h2 className="admin-card-title">Storage Browser</h2>
            <p className="admin-card-note">バケット内ファイルを選んでOHLCVを表示できます。</p>
            <div className="admin-inline-actions">
              <select
                value={selectedFile}
                onChange={(event) => setSelectedFile(event.target.value)}
                className="admin-field"
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
                className={`admin-button admin-button-muted ${filesLoading ? "admin-button-disabled" : "admin-button-active"}`}
              >
                更新
              </button>
              <button
                type="button"
                onClick={loadSelectedFile}
                disabled={!selectedFile || contentLoading}
                className={`admin-button admin-button-primary ${!selectedFile || contentLoading ? "admin-button-disabled" : "admin-button-active"}`}
              >
                {contentLoading ? "読込中..." : "表示"}
              </button>
            </div>
            <div className="admin-subtle">bucket: `OHLCV_BUCKET`</div>
            {filesError && <p className="admin-message-error">{filesError}</p>}
            {contentError && <p className="admin-message-error">{contentError}</p>}
          </article>
        </section>

        <section className="admin-card admin-chart-section">
          <h2 className="admin-card-title">OHLCV Chart</h2>
          <p className="admin-card-note">
            選択中ファイル: {selectedFile || "なし"} / データ件数: {rows.length}
          </p>
          <OhlcvLightweightChart rows={rows} />
        </section>
      </main>
    </div>
  );
}
