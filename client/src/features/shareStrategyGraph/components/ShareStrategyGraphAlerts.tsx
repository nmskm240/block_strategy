import { Alert } from "@mui/material";
import type { ShareStrategyGraphStatus } from "../hooks/useShareStrategyGraph";

type Props = {
  isMobile: boolean;
  urlImportError: string | null;
  exportStatus: ShareStrategyGraphStatus | null;
  onCloseUrlImportError: () => void;
  onCloseExportStatus: () => void;
};

export function ShareStrategyGraphAlerts({
  isMobile,
  urlImportError,
  exportStatus,
  onCloseUrlImportError,
  onCloseExportStatus,
}: Props) {
  return (
    <>
      {urlImportError && (
        <Alert
          severity="error"
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            right: isMobile ? 16 : undefined,
            zIndex: 10,
            maxWidth: isMobile ? undefined : 520,
          }}
          onClose={onCloseUrlImportError}
        >
          {urlImportError}
        </Alert>
      )}
      {exportStatus && (
        <Alert
          severity={exportStatus.severity}
          sx={{
            position: "absolute",
            top: urlImportError ? 88 : 16,
            left: 16,
            right: isMobile ? 16 : undefined,
            zIndex: 10,
            maxWidth: isMobile ? undefined : 520,
          }}
          onClose={onCloseExportStatus}
        >
          {exportStatus.message}
        </Alert>
      )}
    </>
  );
}
