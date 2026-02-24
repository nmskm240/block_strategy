import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Trade } from "shared";

type EquityCurveChartProps = {
  trades: Trade[];
  equityCurve: number[];
};

type EquityPoint = {
  index: number;
  value: number;
  timeLabel: string;
};

function formatTimeLabel(date: Date | undefined, fallbackIndex: number): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return `#${fallbackIndex + 1}`;
  }
  return date.toLocaleString();
}

function buildEquityPoints(trades: Trade[], equityCurve: number[]): EquityPoint[] {
  return equityCurve.map((value, index) => {
    // grademark often returns an initial capital point at index 0.
    const trade =
      index === 0 ? trades[0] : trades[index - 1] ?? trades[index];
    const time = index === 0 ? trade?.entryTime : trade?.exitTime ?? trade?.entryTime;

    return {
      index,
      value,
      timeLabel: formatTimeLabel(time, index),
    };
  });
}

export function EquityCurveChart({ trades, equityCurve }: EquityCurveChartProps) {
  const data = buildEquityPoints(trades, equityCurve);

  if (data.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: 220,
          display: "grid",
          placeItems: "center",
          color: "#94a3b8",
          fontSize: 12,
        }}
      >
        No equity curve data
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="index"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.16)" }}
            tickFormatter={(value) => `${Number(value) + 1}`}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(value) =>
              Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
          />
          <Tooltip
            contentStyle={{
              background: "#101722",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "#e2e8f0",
            }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value: number | undefined) => [
              Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 }),
              "Equity",
            ]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as EquityPoint | undefined;
              return row ? row.timeLabel : "";
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4da3ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: "#4da3ff", stroke: "#dbeafe" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
