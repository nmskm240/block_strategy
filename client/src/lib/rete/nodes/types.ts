import { ConditionNode } from "./ConditionNode";
import { IndicatorNode } from "./IndicatorNode";
import { OHLCVNode } from "./OHLCVNode";
import { OrderNode } from "./OrderNode";

export type Nodes = IndicatorNode | OrderNode | OHLCVNode | ConditionNode;
