import { ClassicPreset } from "rete";
import { Presets } from "rete-react-plugin";
import "./styles/theme.css";
import {
  ActionNode,
  IndicatorNode,
  LogicGateNode,
  LogicalNode,
  MathNode,
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
  if (node instanceof MathNode) {
    return "rete-node-logical";
  }
  if (node instanceof LogicGateNode) {
    return "rete-node-logical";
  }
  if (node instanceof ActionNode) {
    return "rete-node-action";
  }
  return "rete-node-default";
}

export function ThemedNodeComponent(props: React.ComponentProps<typeof Presets.classic.Node>) {
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

export function ThemedConnectionComponent(
  props: React.ComponentProps<typeof Presets.classic.Connection>,
) {
  void props;
  const { path } = Presets.classic.useConnection();

  if (!path) {
    return null;
  }

  return (
    <svg
      data-testid="connection"
      style={{
        overflow: "visible",
        position: "absolute",
        pointerEvents: "none",
        width: 9999,
        height: 9999,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="rgba(123, 208, 165, 0.22)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        pointerEvents="auto"
      />
      <path
        d={path}
        fill="none"
        stroke="#86f1be"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="10 8"
        opacity={0.95}
      >
        <animate
          attributeName="stroke-dashoffset"
          from="18"
          to="0"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
