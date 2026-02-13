import * as z from "zod";
import { NodeSpecSchema } from "./nodeSpecs";

export const GraphNodeIdSchema = z.string().trim().min(1);

export const GraphPortTypeSchema = z.enum(["NUMERIC", "BOOLEAN"]);
export type GraphPortType = z.infer<typeof GraphPortTypeSchema>;

export const GraphPortSchema = z.object({
  name: z.string().trim().min(1),
  type: GraphPortTypeSchema,
});
export type GraphPort = z.infer<typeof GraphPortSchema>;

export const GraphPortRefSchema = z.object({
  nodeId: GraphNodeIdSchema,
  portName: z.string().trim().min(1),
});
export type GraphPortRef = z.infer<typeof GraphPortRefSchema>;

export const GraphEdgeSchema = z.object({
  from: GraphPortRefSchema,
  to: GraphPortRefSchema,
});
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphNodeSchema = z.object({
  id: GraphNodeIdSchema,
  spec: NodeSpecSchema,
});
export type GraphNode = z.infer<
  typeof GraphNodeSchema
>;

export const Graph = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});

export type Graph = z.infer<typeof Graph>;
