import { GetSchemes } from "rete";
import { ReactArea2D } from "rete-react-plugin";
import { ContextMenuExtra } from "rete-context-menu-plugin";
import { Connection } from "../connection";
import { NodeBase } from "../nodes";

export type Schemes = GetSchemes<NodeBase, Connection<NodeBase, NodeBase>>;
export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;
