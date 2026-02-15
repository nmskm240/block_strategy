import { ActionNode } from "./ActionNode";
import { ConditionNode } from "./ConditionNode";
import { IndicatorNode } from "./IndicatorNode";
import { OHLCVNode } from "./OHLCVNode";

export type Nodes = IndicatorNode | ActionNode | OHLCVNode | ConditionNode;
