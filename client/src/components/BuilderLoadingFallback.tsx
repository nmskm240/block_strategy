import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

export function BuilderLoadingFallback() {
  const [loadingAnimationData, setLoadingAnimationData] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    fetch(`${import.meta.env.BASE_URL}loading.json`)
      .then((response) => response.text())
      .then((text) => {
        if (active) setLoadingAnimationData(text);
      })
      .catch(() => {
        if (active) setLoadingAnimationData("");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      style={{
        height: "94.5dvh",
        display: "grid",
        placeItems: "center",
        background: "rgba(255, 255, 255, 0.7)",
      }}
    >
      {loadingAnimationData ? (
        <DotLottieReact
          data={loadingAnimationData}
          autoplay
          loop
          style={{ width: 220, height: 220 }}
        />
      ) : (
        <div style={{ fontSize: 14, color: "#666" }}>Loading...</div>
      )}
    </div>
  );
}
