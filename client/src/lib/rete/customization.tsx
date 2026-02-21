import { ClassicPreset } from "rete";
import { Presets } from "rete-react-plugin";
import "./styles/theme.css";
import {
  ActionNode,
  IndicatorNode,
  LogicalNode,
  OHLCVNode,
} from "./nodes";

function getNodeTypeClass(node: unknown): string {
  if (node instanceof OHLCVNode) {
    return "rete-node-ohlcv";
  }
  if (node instanceof IndicatorNode) {
    return "rete-node-indicator";
  }
  if (node instanceof LogicalNode) {
    return "rete-node-logical";
  }
  if (node instanceof ActionNode) {
    return "rete-node-action";
  }
  return "rete-node-default";
}

export function ThemedNodeComponent(props: Parameters<typeof Presets.classic.Node>[0]) {
  const nodeClass = getNodeTypeClass(props.data);
  return (
    <div className={`rete-themed-node ${nodeClass}`}>
      <Presets.classic.Node {...props} />
    </div>
  );
}

export function ThemedSocketComponent(props: { data: ClassicPreset.Socket }) {
  return <div title={props.data.name} className="rete-themed-socket" />;
}
