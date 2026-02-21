import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  type ISeriesApi,
  type UTCTimestamp,
  type IChartApi,
  createChart,
} from "lightweight-charts";
import type { OHLCV } from "shared";

type Props = {
  rows: OHLCV[];
};

export function OhlcvLightweightChart({ rows }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
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
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.25)" },
        horzLine: { color: "rgba(255,255,255,0.25)" },
      },
      width: container.clientWidth,
      height: 360,
    });

    const candleSeries: ISeriesApi<"Candlestick"> = chart.addSeries(
      CandlestickSeries,
      {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      },
    );
    const volumeSeries: ISeriesApi<"Histogram"> = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: "volume" },
        priceScaleId: "",
        color: "#4b77ff",
      },
    );
    chart.priceScale("").applyOptions({
      scaleMargins: { top: 0.72, bottom: 0 },
    });

    const candleData = rows.map((row) => ({
      time: Math.floor(row.timestamp / 1000) as UTCTimestamp,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
    }));
    const volumeData = rows.map((row) => ({
      time: Math.floor(row.timestamp / 1000) as UTCTimestamp,
      value: row.volume,
      color: row.close >= row.open ? "#22c55e66" : "#ef444466",
    }));
    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
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
  }, [rows]);

  return <div ref={containerRef} style={{ width: "100%", minHeight: 360 }} />;
}
