import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react";

type TOCContextValue = {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
};

const TOCContext = createContext<TOCContextValue>({
  collapsed: false,
  setCollapsed: () => {},
});

export function TOCProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const value = useMemo(() => ({ collapsed, setCollapsed }), [collapsed]);
  return <TOCContext.Provider value={value}>{children}</TOCContext.Provider>;
}

export function useTOCCollapsed() {
  return useContext(TOCContext);
}
