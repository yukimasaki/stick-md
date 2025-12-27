'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();

  // PCでは常に開いた状態を維持
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);

  const toggle = () => {
    // PCでは開閉できない
    if (isMobile) {
      setIsOpen(prev => !prev);
    }
  };

  const open = () => {
    if (isMobile) {
      setIsOpen(true);
    }
  };

  const close = () => {
    // PCでは閉じられない
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // PCでは常に開いた状態を返す
  const effectiveIsOpen = isMobile ? isOpen : true;

  return (
    <SidebarContext.Provider value={{ isOpen: effectiveIsOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

