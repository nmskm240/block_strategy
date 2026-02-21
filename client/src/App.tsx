import { Navigate, Route, Routes } from "react-router-dom";
import { AdminPage } from "@/pages/AdminPage";
import { BuilderPage } from "@/pages/BuilderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BuilderPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
