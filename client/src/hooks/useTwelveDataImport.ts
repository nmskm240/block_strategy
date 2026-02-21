import { useState } from "react";
import { useAdminApiClient } from "@/contexts/apiClientContext";
import type { DateRange, SupportedSymbol } from "shared";

type UseTwelveDataImportOptions = {
  onSuccess?: () => Promise<void> | void;
};

export function useTwelveDataImport(
  options: UseTwelveDataImportOptions = {},
) {
  const api = useAdminApiClient();
  const [symbol, setSymbol] = useState<SupportedSymbol>("AAPL");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [range, setRange] = useState<DateRange>({ since: today, until: today });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const since = range.since.toISOString().slice(0, 10);
      const until = range.until.toISOString().slice(0, 10);
      const imported = await api.importFromTwelveData({
        symbol,
        since,
        until,
      });
      setResult(
        `${imported.symbol}: ${imported.importedCount}件を取込 (${imported.since} - ${imported.until})`,
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
    range,
    setRange,
    loading,
    result,
    error,
    run,
  };
}
