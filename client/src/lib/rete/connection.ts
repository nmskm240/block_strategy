import { ClassicPreset } from "rete";
import { NodeBase } from "./nodes";

export class Connection<
  A extends NodeBase,
  B extends NodeBase,
> extends ClassicPreset.Connection<A, B> {}
