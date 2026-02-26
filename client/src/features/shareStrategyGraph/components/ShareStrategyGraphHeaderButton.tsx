import { Share2 } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";

type Props = {
  disabled?: boolean;
  onClick: () => void;
};

export function ShareStrategyGraphHeaderButton({ disabled = false, onClick }: Props) {
  return (
    <Tooltip title="Share URL">
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          aria-label="Export share URL"
        >
          <Share2 size={18} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
