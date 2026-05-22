import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const SIDEBAR_COLLAPSED_KEY = 'pawalk_sidebar_collapsed';

interface LayoutContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  rightPanel: ReactNode | null;
  setRightPanel: (content: ReactNode | null) => void;
  openRightPanel: (content: ReactNode) => void;
  closeRightPanel: () => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(readCollapsedPreference);
  const [rightPanel, setRightPanel] = useState<ReactNode | null>(null);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  const openRightPanel = useCallback((content: ReactNode) => {
    setRightPanel(content);
  }, []);

  const closeRightPanel = useCallback(() => {
    setRightPanel(null);
  }, []);

  useEffect(() => {
    if (!rightPanel) return;
    return () => setRightPanel(null);
  }, [rightPanel]);

  const value = useMemo<LayoutContextValue>(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      rightPanel,
      setRightPanel,
      openRightPanel,
      closeRightPanel,
    }),
    [sidebarCollapsed, toggleSidebar, setSidebarCollapsed, rightPanel, openRightPanel, closeRightPanel]
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
