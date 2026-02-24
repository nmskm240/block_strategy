import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { BuilderLoadingFallback } from "@/components/BuilderLoadingFallback";
import { LandingPage } from "@/pages/LandingPage";
import { Layout } from "./components/Layout";

const BuilderPage = lazy(async () => {
  const [mod] = await Promise.all([
    import("@/pages/BuilderPage"),
    new Promise((resolve) => window.setTimeout(resolve, 2000)),
  ]);
  return { default: mod.BuilderPage };
});

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/builder"
          element={
            <Suspense fallback={<BuilderLoadingFallback />}>
              <BuilderPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
