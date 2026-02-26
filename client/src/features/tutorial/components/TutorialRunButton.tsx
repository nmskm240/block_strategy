import { IconButton, Tooltip } from "@mui/material";
import { CircleHelp } from "lucide-react";

type Props = {
  onClick: () => void;
};

export function TutorialRunButton({ onClick }: Props) {
  return (
    <Tooltip title="チュートリアルを表示">
      <IconButton size="small" onClick={onClick} aria-label="Show tutorial">
        <CircleHelp />
      </IconButton>
    </Tooltip>
  );
}
