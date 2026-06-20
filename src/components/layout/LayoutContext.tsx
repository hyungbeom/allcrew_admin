"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type LayoutContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  pageHeaderTitle: ReactNode | null;
  setPageHeaderTitle: (title: ReactNode | null) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pageHeaderTitle, setPageHeaderTitleState] = useState<ReactNode | null>(null);

  const setPageHeaderTitle = useCallback((title: ReactNode | null) => {
    setPageHeaderTitleState(title);
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggleCollapsed: () => setCollapsed((prev) => !prev),
        pageHeaderTitle,
        setPageHeaderTitle,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return context;
}
