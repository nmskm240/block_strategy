import { useState } from "react";
import { useAdminApiClient } from "@/contexts/apiClientContext";
import type { SupportedSymbol } from "shared";

type UseTwelveDataImportOptions = {
  onSuccess?: () => Promise<void> | void;
};

export function useTwelveDataImport(
  options: UseTwelveDataImportOptions = {},
) {
  const api = useAdminApiClient();
  const [symbol, setSymbol] = useState<SupportedSymbol>("AAPL");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const imported = await api.importFromTwelveData({ symbol, date });
      setResult(
        `${imported.symbol} ${imported.date}: ${imported.importedCount}件を取込 (${imported.since} - ${imported.until})`,
      );
      await options.onSuccess?.();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return {
    symbol,
    setSymbol,
    date,
    setDate,
    loading,
    result,
    error,
    run,
  };
}
