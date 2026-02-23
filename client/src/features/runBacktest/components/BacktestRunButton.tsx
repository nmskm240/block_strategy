import { Play } from "lucide-react";
import { useState } from "react";
import { Fab } from "@mui/material";
import { BacktestRunDialog } from "@/features/runBacktest/components/BacktestRunDialog";
import type { EditorHandle } from "@/lib/rete";
import type { BacktestResult } from "shared";

type Props = {
  editorHandle: EditorHandle;
  onRunSuccess: (item: BacktestResult) => void;
  onRunError?: (message: string) => void;
};

export function BacktestRunButton({
  editorHandle,
  onRunSuccess,
  onRunError,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Fab
        data-tour="backtest-run-button"
        onClick={() => setIsModalOpen(true)}
        onPointerDown={(event) => event.stopPropagation()}
        sx={{
          position: "absolute",
          right: 16,
          bottom: 16,
          zIndex: 10,
          bgcolor: "#3a4aa8",
          color: "#fff",
          "&:hover": { bgcolor: "#4658bf" },
        }}
      >
        <Play />
      </Fab>

      <BacktestRunDialog
        open={isModalOpen}
        editorHandle={editorHandle}
        onClose={() => setIsModalOpen(false)}
        onRunSuccess={onRunSuccess}
        onRunError={onRunError ?? (() => {})}
      />
    </>
  );
}
