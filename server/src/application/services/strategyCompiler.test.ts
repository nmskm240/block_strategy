import {
  ActionNode,
  IndicatorNode,
  LogicalNode,
  OHLCVNode,
  StrategyGraphBuilder,
  StrategyGraphNodeId,
} from "@server/domain/strategyGraph";
import { DataFrame } from "data-forge";
import { describe, expect, it } from "bun:test";
import { compileSignals } from "./strategyCompiler";
import type { OHLCV } from "@shared/types";

function makeBars(rows: Array<{ open: number; close: number }>): OHLCV[] {
  return rows.map((row, index) => ({
    timestamp: new Date(Date.UTC(2026, 0, 1, 0, index, 0)).getTime(),
    open: row.open,
    high: Math.max(row.open, row.close) + 1,
    low: Math.min(row.open, row.close) - 1,
    close: row.close,
    volume: 100 + index,
  }));
}

describe("strategyCompiler.compileSignals", () => {
  it("logicalサブグラフのENTRY/EXITトリガーをシグナルへ反映できる", () => {
    const open = new OHLCVNode(StrategyGraphNodeId("open"), {
      kind: "ohlcv",
      params: { kind: "OPEN", symbol: "TEST", timeframe: "1h" },
    });
    const close = new OHLCVNode(StrategyGraphNodeId("close"), {
      kind: "ohlcv",
      params: { kind: "CLOSE", symbol: "TEST", timeframe: "1h" },
    });
    const entryCond = new LogicalNode(StrategyGraphNodeId("entry-cond"), {
      kind: "logical",
      operator: ">",
      inputs: { left: 0, right: 0 },
      outputs: { true: true },
    });
    const exitCond = new LogicalNode(StrategyGraphNodeId("exit-cond"), {
      kind: "logical",
      operator: "<",
      inputs: { left: 0, right: 0 },
      outputs: { true: true },
    });
    const entry = new ActionNode(StrategyGraphNodeId("entry"), {
      kind: "action",
      actionType: "marketEntry",
      params: { side: "BUY", size: 1 },
    });
    const exit = new ActionNode(StrategyGraphNodeId("exit"), {
      kind: "action",
      actionType: "marketExit",
      params: { size: 1 },
    });

    const graph = new StrategyGraphBuilder()
      .addNode(open)
      .addNode(close)
      .addNode(entryCond)
      .addNode(exitCond)
      .addNode(entry)
      .addNode(exit)
      .connect({
        from: { nodeId: close.id, portName: "value" },
        to: { nodeId: entryCond.id, portName: "left" },
      })
      .connect({
        from: { nodeId: open.id, portName: "value" },
        to: { nodeId: entryCond.id, portName: "right" },
      })
      .connect({
        from: { nodeId: close.id, portName: "value" },
        to: { nodeId: exitCond.id, portName: "left" },
      })
      .connect({
        from: { nodeId: open.id, portName: "value" },
        to: { nodeId: exitCond.id, portName: "right" },
      })
      .connect({
        from: { nodeId: entryCond.id, portName: "true" },
        to: { nodeId: entry.id, portName: "trigger" },
      })
      .connect({
        from: { nodeId: exitCond.id, portName: "true" },
        to: { nodeId: exit.id, portName: "trigger" },
      })
      .build();

    const bars = makeBars([
      { open: 10, close: 11 },
      { open: 12, close: 10 },
      { open: 9, close: 9 },
    ]);

    const result = compileSignals(graph, new DataFrame(bars)).toArray();

    expect(result.map((row) => row.entrySignal)).toEqual([true, false, false]);
    expect(result.map((row) => row.exitSignal)).toEqual([false, true, false]);
    expect(result.map((row) => row.entryDirection)).toEqual([1, 1, 1]);
  });

  it("同一バーで複数ENTRYが発火した場合はSHORTが優先される", () => {
    const open = new OHLCVNode(StrategyGraphNodeId("open"), {
      kind: "ohlcv",
      params: { kind: "OPEN", symbol: "TEST", timeframe: "1h" },
    });
    const close = new OHLCVNode(StrategyGraphNodeId("close"), {
      kind: "ohlcv",
      params: { kind: "CLOSE", symbol: "TEST", timeframe: "1h" },
    });
    const longCond = new LogicalNode(StrategyGraphNodeId("long-cond"), {
      kind: "logical",
      operator: ">=",
      inputs: { left: 0, right: 0 },
      outputs: { true: true },
    });
    const shortCond = new LogicalNode(StrategyGraphNodeId("short-cond"), {
      kind: "logical",
      operator: "<=",
      inputs: { left: 0, right: 0 },
      outputs: { true: true },
    });
    const longEntry = new ActionNode(StrategyGraphNodeId("long-entry"), {
      kind: "action",
      actionType: "marketEntry",
      params: { side: "BUY", size: 1 },
    });
    const shortEntry = new ActionNode(StrategyGraphNodeId("short-entry"), {
      kind: "action",
      actionType: "marketEntry",
      params: { side: "SELL", size: 1 },
    });

    const graph = new StrategyGraphBuilder()
      .addNode(open)
      .addNode(close)
      .addNode(longCond)
      .addNode(shortCond)
      .addNode(longEntry)
      .addNode(shortEntry)
      .connect({
        from: { nodeId: close.id, portName: "value" },
        to: { nodeId: longCond.id, portName: "left" },
      })
      .connect({
        from: { nodeId: open.id, portName: "value" },
        to: { nodeId: longCond.id, portName: "right" },
      })
      .connect({
        from: { nodeId: close.id, portName: "value" },
        to: { nodeId: shortCond.id, portName: "left" },
      })
      .connect({
        from: { nodeId: open.id, portName: "value" },
        to: { nodeId: shortCond.id, portName: "right" },
      })
      .connect({
        from: { nodeId: longCond.id, portName: "true" },
        to: { nodeId: longEntry.id, portName: "trigger" },
      })
      .connect({
        from: { nodeId: shortCond.id, portName: "true" },
        to: { nodeId: shortEntry.id, portName: "trigger" },
      })
      .build();

    const bars = makeBars([
      { open: 10, close: 10 },
      { open: 10, close: 11 },
      { open: 10, close: 9 },
    ]);

    const result = compileSignals(graph, new DataFrame(bars)).toArray();

    expect(result.map((row) => row.entrySignal)).toEqual([true, true, true]);
    expect(result.map((row) => row.entryDirection)).toEqual([-1, 1, -1]);
    expect(result.map((row) => row.exitSignal)).toEqual([false, false, false]);
  });

  it("indicator入力が不足している場合は例外を投げる", () => {
    const sma = new IndicatorNode(StrategyGraphNodeId("sma"), {
      kind: "indicator",
      indicatorType: "sma",
      params: { period: 2 },
      inputs: { source: 0 },
      outputs: { value: 0 },
    });
    const entry = new ActionNode(StrategyGraphNodeId("entry"), {
      kind: "action",
      actionType: "marketEntry",
      params: { side: "BUY", size: 1 },
    });

    const graph = new StrategyGraphBuilder()
      .addNode(sma)
      .addNode(entry)
      .connect({
        from: { nodeId: sma.id, portName: "value" },
        to: { nodeId: entry.id, portName: "trigger" },
      })
      .build();

    const bars = makeBars([
      { open: 10, close: 11 },
      { open: 10, close: 10 },
    ]);

    expect(() => compileSignals(graph, new DataFrame(bars))).toThrow(
      "Missing input 'source' for indicator node 'sma'",
    );
  });

  it("多層Indicator（sma→sma）を経由した条件でENTRYシグナルを生成できる", () => {
    const close = new OHLCVNode(StrategyGraphNodeId("close"), {
      kind: "ohlcv",
      params: { kind: "CLOSE", symbol: "TEST", timeframe: "1h" },
    });
    const sma1 = new IndicatorNode(StrategyGraphNodeId("sma1"), {
      kind: "indicator",
      indicatorType: "sma",
      params: { period: 2 },
      inputs: { source: 0 },
      outputs: { value: 0 },
    });
    const sma2 = new IndicatorNode(StrategyGraphNodeId("sma2"), {
      kind: "indicator",
      indicatorType: "sma",
      params: { period: 2 },
      inputs: { source: 0 },
      outputs: { value: 0 },
    });
    const cond = new LogicalNode(StrategyGraphNodeId("cond"), {
      kind: "logical",
      operator: "==",
      inputs: { left: 0, right: 0 },
      outputs: { true: true },
    });
    const entry = new ActionNode(StrategyGraphNodeId("entry"), {
      kind: "action",
      actionType: "marketEntry",
      params: { side: "BUY", size: 1 },
    });

    const graph = new StrategyGraphBuilder()
      .addNode(close)
      .addNode(sma1)
      .addNode(sma2)
      .addNode(cond)
      .addNode(entry)
      .connect({
        from: { nodeId: close.id, portName: "value" },
        to: { nodeId: sma1.id, portName: "source" },
      })
      .connect({
        from: { nodeId: sma1.id, portName: "value" },
        to: { nodeId: sma2.id, portName: "source" },
      })
      .connect({
        from: { nodeId: sma2.id, portName: "value" },
        to: { nodeId: cond.id, portName: "left" },
      })
      .connect({
        from: { nodeId: sma2.id, portName: "value" },
        to: { nodeId: cond.id, portName: "right" },
      })
      .connect({
        from: { nodeId: cond.id, portName: "true" },
        to: { nodeId: entry.id, portName: "trigger" },
      })
      .build();

    const bars = makeBars([
      { open: 1, close: 1 },
      { open: 2, close: 2 },
      { open: 3, close: 3 },
      { open: 4, close: 4 },
      { open: 5, close: 5 },
    ]);

    const result = compileSignals(graph, new DataFrame(bars)).toArray();

    expect(result.some((row) => row.entrySignal)).toBe(true);
    expect(result.map((row) => row.entryDirection)).toEqual([1, 1, 1, 1, 1]);
    expect(result.map((row) => row.exitSignal)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ]);
  });

  it("ボリンジャーバンドの各ポート（upper/middle/lower）を個別に扱える", () => {
    const bars = makeBars([
      { open: 10, close: 10 },
      { open: 10, close: 10 },
      { open: 13, close: 13 },
      { open: 13, close: 13 },
      { open: 8, close: 8 },
    ]);

    const runPortCase = (
      rightPortName: "upperBand" | "middleBand" | "lowerBand",
      operator: "==" | "!=" | "<" | "<=" | ">" | ">=",
      side: "BUY" | "SELL",
    ) => {
      const close = new OHLCVNode(StrategyGraphNodeId(`close-${rightPortName}`), {
        kind: "ohlcv",
        params: { kind: "CLOSE", symbol: "TEST", timeframe: "1h" },
      });
      const bband = new IndicatorNode(StrategyGraphNodeId(`bband-${rightPortName}`), {
        kind: "indicator",
        indicatorType: "bband",
        params: { period: 3, stdDev: 1 },
        inputs: { source: 0 },
        outputs: { upperBand: 0, middleBand: 0, lowerBand: 0 },
      });
      const cond = new LogicalNode(StrategyGraphNodeId(`cond-${rightPortName}`), {
        kind: "logical",
        operator,
        inputs: { left: 0, right: 0 },
        outputs: { true: true },
      });
      const entry = new ActionNode(StrategyGraphNodeId(`entry-${rightPortName}`), {
        kind: "action",
        actionType: "marketEntry",
        params: { side, size: 1 },
      });

      const graph = new StrategyGraphBuilder()
        .addNode(close)
        .addNode(bband)
        .addNode(cond)
        .addNode(entry)
        .connect({
          from: { nodeId: close.id, portName: "value" },
          to: { nodeId: bband.id, portName: "source" },
        })
        .connect({
          from: { nodeId: close.id, portName: "value" },
          to: { nodeId: cond.id, portName: "left" },
        })
        .connect({
          from: { nodeId: bband.id, portName: rightPortName },
          to: { nodeId: cond.id, portName: "right" },
        })
        .connect({
          from: { nodeId: cond.id, portName: "true" },
          to: { nodeId: entry.id, portName: "trigger" },
        })
        .build();

      return compileSignals(graph, new DataFrame(bars)).toArray();
    };

    const upperResult = runPortCase("upperBand", "<=", "BUY");
    expect(upperResult.map((row) => row.entrySignal)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
    expect(upperResult.map((row) => row.entryDirection)).toEqual([
      1,
      1,
      1,
      1,
      1,
    ]);

    const middleResult = runPortCase("middleBand", ">=", "SELL");
    expect(middleResult.map((row) => row.entrySignal)).toEqual([
      false,
      false,
      true,
      false,
      false,
    ]);
    expect(middleResult.map((row) => row.entryDirection)).toEqual([
      1,
      1,
      -1,
      1,
      1,
    ]);

    const lowerResult = runPortCase("lowerBand", "<=", "BUY");
    expect(lowerResult.map((row) => row.entrySignal)).toEqual([
      false,
      true,
      false,
      false,
      false,
    ]);
    expect(lowerResult.map((row) => row.entryDirection)).toEqual([
      1,
      1,
      1,
      1,
      1,
    ]);
  });
});
