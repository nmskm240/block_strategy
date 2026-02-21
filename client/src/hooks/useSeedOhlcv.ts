import { useState } from "react";
import { useAdminApiClient } from "@/contexts/apiClientContext";

type UseSeedOhlcvOptions = {
  onSuccess?: () => Promise<void> | void;
};

export function useSeedOhlcv(
  options: UseSeedOhlcvOptions = {},
) {
  const api = useAdminApiClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const seeded = await api.seedOhlcv({ symbol: "NASDAQ:AAPL", days: 14 });
      setResult(
        `${seeded.symbol}: ${seeded.insertedCount}件を投入 (${seeded.since} - ${seeded.until})`,
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
    loading,
    result,
    error,
    run,
  };
}
