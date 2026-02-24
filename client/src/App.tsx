import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { Layout } from "./components/Layout";

const BuilderPage = lazy(async () => {
  const mod = await import("@/pages/BuilderPage");
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
            <Suspense fallback={<div>Loading builder...</div>}>
              <BuilderPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
