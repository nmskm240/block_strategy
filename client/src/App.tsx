import { Navigate, Route, Routes } from "react-router-dom";
import { AdminPage } from "@/pages/AdminPage";
import { BuilderPage } from "@/pages/BuilderPage";
import { LandingPage } from "@/pages/LandingPage";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
