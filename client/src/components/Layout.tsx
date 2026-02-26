import { type ReactNode, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export type LayoutOutletContext = {
  setHeaderRightContent: (content: ReactNode | null) => void;
};

export function Layout() {
  const [headerRightContent, setHeaderRightContent] = useState<ReactNode | null>(null);

  return (
    <>
      <Header rightContent={headerRightContent} />
      <Outlet context={{ setHeaderRightContent }} />
    </>
  );
}
