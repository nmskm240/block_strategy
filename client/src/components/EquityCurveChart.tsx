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
import { appPaletteCustom } from "@/theme";

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
          color: appPaletteCustom.chart.axisText,
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
          <CartesianGrid stroke={appPaletteCustom.chart.grid} vertical={false} />
          <XAxis
            dataKey="index"
            tick={{ fill: appPaletteCustom.chart.axisText, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: appPaletteCustom.chart.axisLine }}
            tickFormatter={(value) => `${Number(value) + 1}`}
          />
          <YAxis
            tick={{ fill: appPaletteCustom.chart.axisText, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(value) =>
              Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
          />
          <Tooltip
            contentStyle={{
              background: appPaletteCustom.chart.tooltipBg,
              border: appPaletteCustom.chart.tooltipBorder,
              borderRadius: 8,
              color: appPaletteCustom.chart.tooltipText,
            }}
            labelStyle={{ color: appPaletteCustom.chart.axisText }}
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
            stroke={appPaletteCustom.chart.line}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 3,
              fill: appPaletteCustom.chart.line,
              stroke: appPaletteCustom.chart.activeDotStroke,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
