import React, { createContext, useContext, type ReactNode } from "react";

type SidebarCollapseContextValue = {
  onCollapse: () => void;
};

const SidebarCollapseContext = createContext<SidebarCollapseContextValue>({
  onCollapse: () => {},
});

export function SidebarCollapseProvider({
  onCollapse,
  children,
}: {
  onCollapse: () => void;
  children: ReactNode;
}) {
  return (
    <SidebarCollapseContext.Provider value={{ onCollapse }}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}

export function useSidebarCollapse() {
  return useContext(SidebarCollapseContext);
}
