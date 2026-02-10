import type { BacktestResult, GraphSnapshot, Trade } from "../types/trading";

type AnyNode = GraphSnapshot["nodes"][number];

type Incoming = {
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
};

function hashSymbol(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function makeRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function generatePrices(symbol: string, length: number) {
  const rng = makeRng(hashSymbol(symbol));
  const prices: number[] = [];
  let price = 120 + rng() * 40;
  for (let i = 0; i < length; i += 1) {
    const delta = (rng() - 0.5) * 1.5;
    price = Math.max(0.5, price + delta);
    prices.push(Math.round(price * 100) / 100);
  }
  return prices;
}

function sma(series: number[], period: number) {
  const result = new Array(series.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < series.length; i += 1) {
    sum += series[i];
    if (i >= period) sum -= series[i - period];
    if (i >= period - 1) result[i] = sum / period;
  }
  return result;
}

function getControlValue(node: AnyNode, key: string) {
  const control = (node.controls as Record<string, any>)[key];
  if (!control) return undefined;
  return control.value ?? control.options?.initial;
}

function findIncoming(snapshot: GraphSnapshot, nodeId: string, inputKey: string) {
  return snapshot.connections.filter(
    (c) => c.target === nodeId && c.targetInput === inputKey
  ) as Incoming[];
}

function parseSeries(text: string | undefined, prices: number[]) {
  if (!text) return null;
  const trimmed = text.trim().toLowerCase();
  if (trimmed === "price" || trimmed === "close") return prices;
  const match = trimmed.match(/^sma\((\d+)\)$/);
  if (match) return sma(prices, Number(match[1]));
  return null;
}

export function runBacktestFromGraph(
  snapshot: GraphSnapshot,
  symbol: string
): BacktestResult {
  const prices = generatePrices(symbol, 200);
  const nodesById = new Map(snapshot.nodes.map((n) => [n.id, n]));

  const indicatorSeries = new Map<string, number[]>();
  const conditionSeries = new Map<string, boolean[]>();

  snapshot.nodes.forEach((node) => {
    if (node.label !== "Indicator") return;
    const indicator = String(getControlValue(node, "indicator") ?? "SMA");
    const period = Number(getControlValue(node, "period") ?? 20);
    if (indicator.toLowerCase() === "sma") {
      indicatorSeries.set(node.id, sma(prices, Math.max(1, period)));
    }
  });

  snapshot.nodes.forEach((node) => {
    if (node.label !== "Condition") return;
    const leftConn = findIncoming(snapshot, node.id, "left")[0];
    const rightConn = findIncoming(snapshot, node.id, "right")[0];

    let leftSeries: number[] | null = null;
    let rightSeries: number[] | null = null;

    if (leftConn) {
      const source = nodesById.get(leftConn.source);
      if (source?.label === "Indicator") {
        leftSeries = indicatorSeries.get(source.id) ?? null;
      }
    }
    if (rightConn) {
      const source = nodesById.get(rightConn.source);
      if (source?.label === "Indicator") {
        rightSeries = indicatorSeries.get(source.id) ?? null;
      }
    }

    if (!leftSeries) {
      leftSeries = parseSeries(String(getControlValue(node, "left") ?? ""), prices);
    }
    if (!rightSeries) {
      rightSeries = parseSeries(String(getControlValue(node, "right") ?? ""), prices);
    }

    const op = String(getControlValue(node, "op") ?? ">").trim();
    const cond: boolean[] = prices.map((_, i) => {
      const left = leftSeries?.[i];
      const right = rightSeries?.[i];
      if (Number.isNaN(left) || Number.isNaN(right) || left == null || right == null) {
        return false;
      }
      switch (op) {
        case ">":
          return left > right;
        case "<":
          return left < right;
        case ">=":
          return left >= right;
        case "<=":
          return left <= right;
        case "==":
          return left === right;
        case "!=":
          return left !== right;
        default:
          return left > right;
      }
    });
    conditionSeries.set(node.id, cond);
  });

  let cash = 10000;
  let position = 0;
  let avgPrice = 0;
  const trades: Trade[] = [];

  const orderNodes = snapshot.nodes.filter((node) => node.label === "Order");

  for (let i = 0; i < prices.length; i += 1) {
    const price = prices[i];
    orderNodes.forEach((node) => {
      const side = String(getControlValue(node, "side") ?? "BUY").toUpperCase();
      const size = Math.max(1, Number(getControlValue(node, "size") ?? 1));
      const triggerConn = findIncoming(snapshot, node.id, "trigger")[0];
      if (!triggerConn) return;
      const source = nodesById.get(triggerConn.source);
      if (!source || source.label !== "Condition") return;
      const baseSeries = conditionSeries.get(source.id);
      if (!baseSeries) return;
      const isTrueOutput = triggerConn.sourceOutput === "true";
      const triggered = isTrueOutput ? baseSeries[i] : !baseSeries[i];
      if (!triggered) return;

      if (side === "BUY") {
        const cost = price * size;
        if (cash < cost) return;
        const newPosition = position + size;
        const newAvg =
          position === 0 ? price : (avgPrice * position + price * size) / newPosition;
        cash -= cost;
        position = newPosition;
        avgPrice = newAvg;
        trades.unshift({
          side: "BUY",
          price,
          size,
          time: `T${i}`,
        });
      } else if (side === "SELL") {
        if (position <= 0) return;
        const sellSize = Math.min(size, position);
        cash += price * sellSize;
        position -= sellSize;
        if (position === 0) avgPrice = 0;
        trades.unshift({
          side: "SELL",
          price,
          size: sellSize,
          time: `T${i}`,
        });
      }
    });
  }

  const lastPrice = prices[prices.length - 1] ?? 0;
  const finalEquity = cash + position * lastPrice;
  return {
    trades,
    startCash: 10000,
    finalCash: cash,
    finalPosition: position,
    finalEquity,
    pnl: finalEquity - 10000,
    lastPrice,
  };
}
