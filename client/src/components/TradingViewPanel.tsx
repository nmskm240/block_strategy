import { useEffect, useRef } from "react";

type TradingViewPanelProps = {
  symbol: string;
};

export function TradingViewPanel({ symbol }: TradingViewPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    host.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.width = "100%";
    widgetContainer.style.height = "100%";

    const widgetInner = document.createElement("div");
    widgetInner.className = "tradingview-widget-container__widget";
    widgetInner.style.width = "100%";
    widgetInner.style.height = "100%";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      const tv = (window as unknown as { TradingView?: any }).TradingView;
      if (!tv) return;
      // eslint-disable-next-line new-cap
      new tv.widget({
        autosize: true,
        symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "ja",
        toolbar_bg: "#1d1d24",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        container_id: widgetInner.id || undefined,
      });
    };

    widgetInner.id = `tv-${Math.random().toString(36).slice(2)}`;

    widgetContainer.appendChild(widgetInner);
    host.appendChild(widgetContainer);
    host.appendChild(script);
  }, [symbol]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(12, 12, 16, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 10,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 34,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          background: "rgba(30, 30, 38, 0.9)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#fff",
          fontSize: 12,
          userSelect: "none",
        }}
      >
        TradingView Chart
      </div>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "calc(100% - 34px)" }}
      />
    </div>
  );
}
