import { ClassicPreset } from "rete";
import { Nodes } from "./nodes";

export class Connection<
  A extends Nodes,
  B extends Nodes,
> extends ClassicPreset.Connection<A, B> {}
