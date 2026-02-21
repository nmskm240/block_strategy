import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ApiClient } from "@/services/apiClient";
import { AdminApiClient } from "@/services/adminClient";
import { BacktestApiClient } from "@/services/backtestClient";

type ApiClientsContextValue = {
  adminApiClient: AdminApiClient;
  backtestApiClient: BacktestApiClient;
};

const ApiClientsContext = createContext<ApiClientsContextValue | null>(null);

export function ApiClientProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ApiClientsContextValue>(() => {
    const apiClient = new ApiClient();
    return {
      adminApiClient: new AdminApiClient(apiClient),
      backtestApiClient: new BacktestApiClient(apiClient),
    };
  }, []);

  return (
    <ApiClientsContext.Provider value={value}>
      {children}
    </ApiClientsContext.Provider>
  );
}

function useApiClientsContext(): ApiClientsContextValue {
  const context = useContext(ApiClientsContext);
  if (!context) {
    throw new Error(
      "useApiClientsContext must be used within ApiClientProvider",
    );
  }
  return context;
}

export function useAdminApiClient(): AdminApiClient {
  return useApiClientsContext().adminApiClient;
}

export function useBacktestApiClient(): BacktestApiClient {
  return useApiClientsContext().backtestApiClient;
}
