import { useEffect, useRef } from "react";
import {
  ColorType,
  LineSeries,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";

type EquityCurveChartProps = {
  points: Array<{ time: UTCTimestamp; value: number }>;
};

export function EquityCurveChart({ points }: EquityCurveChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 180,
      layout: {
        background: { type: ColorType.Solid, color: "#0b1119" },
        textColor: "#cad4e3",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.07)" },
        horzLines: { color: "rgba(255,255,255,0.07)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.2)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.2)",
        timeVisible: true,
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#4da3ff",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    lineSeries.setData(points);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    resizeObserver.observe(container);

    chartRef.current = chart;
    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [points]);

  return <div ref={containerRef} style={{ width: "100%", minHeight: 180 }} />;
}
