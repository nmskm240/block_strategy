import {
  ActionNode,
  extractSubgraph,
  topologicalSort,
  type StrategyGraph,
  type StrategyGraphNode,
  type StrategyGraphNodeEdge,
  type StrategyGraphNodeId,
  StrategyGraphNodePortKey,
} from "@server/domain/strategyGraph";
import {
  IndicatorRegistry,
  NodeKind,
  type BooleanLogicNodeSpec,
  type IndicatorKind,
  type IndicatorNodeSpec,
  type LogicalNodeSpec,
  type MathNodeSpec,
  type OHLCV,
  type OhlcvNodeSpec,
} from "@shared/types";
import { DataFrame, Series, type ISeries } from "data-forge";
import "data-forge-indicators";
import type { IBar } from "grademark";
import { match } from "ts-pattern";

type NumericSeries = ISeries<number, number>;
type BooleanSeries = ISeries<number, boolean>;
type AnySeries = ISeries<number, unknown>;
type NodeSeriesMap = Map<string, AnySeries>;

export type StrategySignalBar = IBar & {
  entrySignal: boolean;
  entryDirection: number;
  exitSignal: boolean;
};

type CompileContext = {
  graph: StrategyGraph;
  inputDf: DataFrame<number, OHLCV>;
  incomingByTargetPort: Map<string, StrategyGraphNodeEdge>;
  nodeSeriesMemo: Map<StrategyGraphNodeId, NodeSeriesMap>;
};

function asBooleanSeries(source: AnySeries): BooleanSeries {
  return new Series(
    source.toArray().map((value) => Boolean(value)),
  ) as BooleanSeries;
}

function asNumericSeries(
  source: AnySeries,
  errorContext: string,
): NumericSeries {
  const values = source.toArray();
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`${errorContext}: expected numeric series values`);
    }
  }
  return source as NumericSeries;
}

function isEntryActionSpec(spec: ActionNode["spec"]): boolean {
  const actionType = (spec as { actionType?: unknown }).actionType;
  if (actionType === "marketEntry") {
    return true;
  }
  if (actionType === "marketExit") {
    return false;
  }
  // Legacy fallback.
  const maybeKind = (spec as { kind?: unknown }).kind;
  return maybeKind === "ENTRY";
}

function isExitActionSpec(spec: ActionNode["spec"]): boolean {
  const actionType = (spec as { actionType?: unknown }).actionType;
  if (actionType === "marketExit") {
    return true;
  }
  if (actionType === "marketEntry") {
    return false;
  }
  // Legacy fallback.
  const maybeKind = (spec as { kind?: unknown }).kind;
  return maybeKind === "EXIT";
}

function getEntryActionDirection(spec: ActionNode["spec"]): "LONG" | "SHORT" {
  if (!isEntryActionSpec(spec)) {
    throw new Error("Expected marketEntry action for entry direction");
  }
  const maybeDirection = (spec as { direction?: unknown }).direction;
  if (maybeDirection === "LONG" || maybeDirection === "SHORT") {
    return maybeDirection;
  }
  const legacy = spec as {
    actionType?: string;
    params?: { side?: "BUY" | "SELL" };
  };
  return legacy.actionType === "marketEntry" && legacy.params?.side === "SELL"
    ? "SHORT"
    : "LONG";
}

function getNodePortSeries(
  nodeId: StrategyGraphNodeId,
  portName: string,
  context: CompileContext,
): AnySeries {
  const nodeOutputs = context.nodeSeriesMemo.get(nodeId);
  if (!nodeOutputs) {
    const node = context.graph.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Unknown source node: ${nodeId}`);
    }
    compileNode(node, context);
  }

  const compiled = context.nodeSeriesMemo.get(nodeId);
  const series = compiled?.get(portName);
  if (!series) {
    throw new Error(
      `Missing compiled output port '${portName}' for node '${nodeId}'`,
    );
  }
  return series;
}

export function compileNode(
  node: StrategyGraphNode,
  context: CompileContext,
): NodeSeriesMap {
  const cached = context.nodeSeriesMemo.get(node.id);
  if (cached) {
    return cached;
  }

  const outputs = new Map<string, AnySeries>();

  match(node.spec)
    .with({ kind: NodeKind.OHLCV }, (spec) =>
      compileOhlcvNode(spec, context, outputs),
    )
    .with({ kind: NodeKind.INDICATOR }, (spec) =>
      compileIndicatorNode(node.id, spec, context, outputs),
    )
    .with({ kind: NodeKind.MATH }, (spec) =>
      compileMathNode(node.id, spec, context, outputs),
    )
    .with({ kind: NodeKind.LOGICAL }, (spec) =>
      compileLogicalNode(node.id, spec, context, outputs),
    )
    .with({ kind: NodeKind.BOOLEAN_LOGIC }, (spec) =>
      compileBooleanLogicNode(node.id, spec, context, outputs),
    )
    .with({ kind: NodeKind.ACTION }, () => {
      // Action nodes are control sinks and do not emit series.
    })
    .exhaustive();

  context.nodeSeriesMemo.set(node.id, outputs);
  return outputs;
}

function compileOhlcvNode(
  spec: OhlcvNodeSpec,
  context: CompileContext,
  outputs: NodeSeriesMap,
): void {
  const column = spec.params.kind.toLowerCase();
  outputs.set("value", context.inputDf.getSeries(column) as AnySeries);
}

function compileIndicatorNode(
  nodeId: StrategyGraphNodeId,
  spec: IndicatorNodeSpec,
  context: CompileContext,
  outputs: NodeSeriesMap,
): void {
  const getInput = (portName: string): NumericSeries => {
    const inputEdge = context.incomingByTargetPort.get(
      StrategyGraphNodePortKey({ nodeId, portName }),
    );
    if (!inputEdge) {
      throw new Error(
        `Missing input '${portName}' for indicator node '${nodeId}'`,
      );
    }
    const source = getNodePortSeries(
      inputEdge.from.nodeId,
      inputEdge.from.portName,
      context,
    );
    return asNumericSeries(
      source,
      `Indicator node '${nodeId}' input '${portName}'`,
    );
  };

  const source = getInput("source");
  match(spec.indicatorType as IndicatorKind)
    .with("sma", () => {
      const typed = IndicatorRegistry.sma.parse(spec);
      outputs.set("value", source.sma(typed.params.period) as AnySeries);
    })
    .with("ema", () => {
      const typed = IndicatorRegistry.ema.parse(spec);
      outputs.set("value", source.ema(typed.params.period) as AnySeries);
    })
    .with("rsi", () => {
      const typed = IndicatorRegistry.rsi.parse(spec);
      outputs.set("value", source.rsi(typed.params.period) as AnySeries);
    })
    .with("momentum", () => {
      const typed = IndicatorRegistry.momentum.parse(spec);
      outputs.set("value", source.momentum(typed.params.period) as AnySeries);
    })
    .with("roc", () => {
      const typed = IndicatorRegistry.roc.parse(spec);
      outputs.set("value", source.roc(typed.params.period) as AnySeries);
    })
    .with("direction", () => {
      const typed = IndicatorRegistry.direction.parse(spec);
      outputs.set("value", source.direction(typed.params.period) as AnySeries);
    })
    .with("extrema", () => {
      outputs.set("value", source.extrema() as AnySeries);
    })
    .with("trends", () => {
      outputs.set("value", source.trends() as AnySeries);
    })
    .with("daysRising", () => {
      outputs.set("value", source.daysRising() as AnySeries);
    })
    .with("daysFalling", () => {
      outputs.set("value", source.daysFalling() as AnySeries);
    })
    .with("streaks", () => {
      const typed = IndicatorRegistry.streaks.parse(spec);
      outputs.set("value", source.streaks(typed.params.period) as AnySeries);
    })
    .with("crsi", () => {
      const typed = IndicatorRegistry.crsi.parse(spec);
      outputs.set(
        "value",
        source.crsi(
          typed.params.rsiPeriod,
          typed.params.streakRsiPeriod,
          typed.params.percentRankPeriod,
        ) as AnySeries,
      );
    })
    .with("bband", () => {
      const typed = IndicatorRegistry.bband.parse(spec);
      const stdDev = typed.params.stdDev;
      const bands = source.bollinger(typed.params.period, stdDev, stdDev);
      outputs.set("upperBand", bands.getSeries("upper") as AnySeries);
      outputs.set("middleBand", bands.getSeries("middle") as AnySeries);
      outputs.set("lowerBand", bands.getSeries("lower") as AnySeries);
    })
    .with("bbandPercentB", () => {
      const typed = IndicatorRegistry.bbandPercentB.parse(spec);
      const stdDev = typed.params.stdDev;
      const bands = source.bollinger(typed.params.period, stdDev, stdDev);
      outputs.set("value", bands.percentB() as AnySeries);
    })
    .with("bbandBandwidth", () => {
      const typed = IndicatorRegistry.bbandBandwidth.parse(spec);
      const stdDev = typed.params.stdDev;
      const bands = source.bollinger(typed.params.period, stdDev, stdDev);
      outputs.set("value", bands.bandwidth() as AnySeries);
    })
    .with("macd", () => {
      const typed = IndicatorRegistry.macd.parse(spec);
      const macd = source.macd(
        typed.params.shortPeriod,
        typed.params.longPeriod,
        typed.params.signalPeriod,
      );
      outputs.set("shortEMA", macd.getSeries("shortEMA") as AnySeries);
      outputs.set("longEMA", macd.getSeries("longEMA") as AnySeries);
      outputs.set("macd", macd.getSeries("macd") as AnySeries);
      outputs.set("signal", macd.getSeries("signal") as AnySeries);
      outputs.set("histogram", macd.getSeries("histogram") as AnySeries);
    })
    .exhaustive();
}

function compileLogicalNode(
  nodeId: StrategyGraphNodeId,
  spec: LogicalNodeSpec,
  context: CompileContext,
  outputs: NodeSeriesMap,
): void {
  const resolveInput = (
    portName: "left" | "right",
    fallbackValue: number,
  ): number[] => {
    const inputEdge = context.incomingByTargetPort.get(
      StrategyGraphNodePortKey({ nodeId, portName }),
    );
    if (inputEdge) {
      return asNumericSeries(
        getNodePortSeries(inputEdge.from.nodeId, inputEdge.from.portName, context),
        `Logical node '${nodeId}' ${portName} input`,
      ).toArray();
    }
    return new Array(context.inputDf.count()).fill(fallbackValue);
  };

  const left = resolveInput("left", spec.inputs.left);
  const right = resolveInput("right", spec.inputs.right);

  const out = left.map((leftValue, index) => {
    const rightValue = right[index];
    if (rightValue === undefined) {
      return false;
    }
    switch (spec.operator) {
      case "==":
        return leftValue === rightValue;
      case "!=":
        return leftValue !== rightValue;
      case "<":
        return leftValue < rightValue;
      case "<=":
        return leftValue <= rightValue;
      case ">":
        return leftValue > rightValue;
      case ">=":
        return leftValue >= rightValue;
      default: {
        const unknown: never = spec.operator;
        throw new Error(`Unknown logical operator '${unknown}'`);
      }
    }
  });
  outputs.set("true", new Series(out) as AnySeries);
}

function compileMathNode(
  nodeId: StrategyGraphNodeId,
  spec: MathNodeSpec,
  context: CompileContext,
  outputs: NodeSeriesMap,
): void {
  const resolveInput = (
    portName: "left" | "right",
    fallbackValue: number,
  ): number[] => {
    const inputEdge = context.incomingByTargetPort.get(
      StrategyGraphNodePortKey({ nodeId, portName }),
    );
    if (inputEdge) {
      return asNumericSeries(
        getNodePortSeries(inputEdge.from.nodeId, inputEdge.from.portName, context),
        `Math node '${nodeId}' ${portName} input`,
      ).toArray();
    }
    return new Array(context.inputDf.count()).fill(fallbackValue);
  };

  const left = resolveInput("left", spec.inputs.left);
  const right = resolveInput("right", spec.inputs.right);
  const out = left.map((leftValue, index) => {
    const rightValue = right[index];
    if (rightValue === undefined) {
      return 0;
    }

    switch (spec.operator) {
      case "+":
        return leftValue + rightValue;
      case "-":
        return leftValue - rightValue;
      case "*":
        return leftValue * rightValue;
      case "/":
        if (rightValue === 0) {
          return 0;
        }
        return leftValue / rightValue;
      case "%":
        if (rightValue === 0) {
          return 0;
        }
        return leftValue % rightValue;
      default: {
        const unknown: never = spec.operator;
        throw new Error(`Unknown math operator '${unknown}'`);
      }
    }
  });

  outputs.set("value", new Series(out) as AnySeries);
}

function compileBooleanLogicNode(
  nodeId: StrategyGraphNodeId,
  spec: BooleanLogicNodeSpec,
  context: CompileContext,
  outputs: NodeSeriesMap,
): void {
  const rowCount = context.inputDf.count();
  const inputKeys = Object.keys(spec.inputs).sort((a, b) => {
    const aIndex = Number.parseInt(a.replace(/^in/, ""), 10);
    const bIndex = Number.parseInt(b.replace(/^in/, ""), 10);
    return aIndex - bIndex;
  });

  const inputValues = inputKeys.map((key) => {
    const inputEdge = context.incomingByTargetPort.get(
      StrategyGraphNodePortKey({ nodeId, portName: key }),
    );
    if (!inputEdge) {
      return new Array(rowCount).fill(spec.inputs[key]);
    }
    return asBooleanSeries(
      getNodePortSeries(inputEdge.from.nodeId, inputEdge.from.portName, context),
    ).toArray();
  });

  const out = new Array<boolean>(rowCount).fill(false);
  for (let i = 0; i < rowCount; i += 1) {
    const values = inputValues.map((series) => Boolean(series[i]));
    switch (spec.operator) {
      case "AND":
        out[i] = values.every(Boolean);
        break;
      case "OR":
        out[i] = values.some(Boolean);
        break;
      case "NOT":
        out[i] = !values[0];
        break;
      default: {
        const unknown: never = spec.operator;
        throw new Error(`Unknown boolean logic operator '${unknown}'`);
      }
    }
  }

  outputs.set("true", new Series(out) as AnySeries);
}

export function compileSignals(
  graph: StrategyGraph,
  inputDf: DataFrame<number, OHLCV>,
): DataFrame<number, StrategySignalBar> {
  const incomingByTargetPort = new Map<string, StrategyGraphNodeEdge>();
  for (const edge of graph.edges) {
    incomingByTargetPort.set(StrategyGraphNodePortKey(edge.to), edge);
  }

  const context: CompileContext = {
    graph,
    inputDf,
    incomingByTargetPort,
    nodeSeriesMemo: new Map(),
  };

  const actions = Array.from(graph.nodes.values()).filter(
    (node): node is ActionNode => node instanceof ActionNode,
  );
  const entryActions = actions.filter(
    (node) => isEntryActionSpec(node.spec),
  );
  const exitActions = actions.filter(
    (node) => isExitActionSpec(node.spec),
  );

  const rowCount = inputDf.count();
  const defaultFalse = new Series<number, boolean>(
    new Array(rowCount).fill(false),
  );

  const triggerFor = (actionNode: ActionNode): BooleanSeries => {
    const subgraph = extractSubgraph(graph, actionNode);
    const sortedNodes = topologicalSort(
      Array.from(subgraph.nodes.values()),
      subgraph.edges,
    );

    for (const node of sortedNodes) {
      if (node instanceof ActionNode) {
        continue;
      }
      compileNode(node, context);
    }

    const triggerEdge = incomingByTargetPort.get(
      StrategyGraphNodePortKey({ nodeId: actionNode.id, portName: "trigger" }),
    );
    if (!triggerEdge) {
      return defaultFalse;
    }

    const series = getNodePortSeries(
      triggerEdge.from.nodeId,
      triggerEdge.from.portName,
      context,
    );
    return asBooleanSeries(series);
  };

  const entryTriggerMap = entryActions.map((action) => ({
    action,
    trigger: triggerFor(action).toArray(),
  }));
  const exitTriggers = exitActions.map((action) =>
    triggerFor(action).toArray(),
  );

  const entrySignal = new Array<boolean>(rowCount).fill(false);
  const entryDirection = new Array<number>(rowCount).fill(1);
  const exitSignal = new Array<boolean>(rowCount).fill(false);

  for (let i = 0; i < rowCount; i += 1) {
    let longTriggered = false;
    let shortTriggered = false;
    for (const { action, trigger } of entryTriggerMap) {
      if (!trigger[i]) {
        continue;
      }
      if (getEntryActionDirection(action.spec) === "SHORT") {
        shortTriggered = true;
      } else {
        longTriggered = true;
      }
    }
    entrySignal[i] = longTriggered || shortTriggered;
    entryDirection[i] = shortTriggered ? -1 : 1; // SHORT overrides LONG.
  }

  for (let i = 0; i < rowCount; i += 1) {
    let triggered = false;
    for (const trigger of exitTriggers) {
      if (trigger[i]) {
        triggered = true;
        break;
      }
    }
    exitSignal[i] = triggered;
  }

  return inputDf
    .withSeries("entrySignal", new Series(entrySignal))
    .withSeries("entryDirection", new Series(entryDirection))
    .withSeries("exitSignal", new Series(exitSignal))
    .withSeries(
      "time",
      inputDf.getSeries("timestamp").select((timestamp) => new Date(timestamp)),
    ) as DataFrame<number, StrategySignalBar>;
}
