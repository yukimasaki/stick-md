'use client';

import { ReactNode } from 'react';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import { cn } from '@/lib/utils';

interface MainContentWrapperProps {
  children: ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const { isOpen } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        isOpen ? "ml-80" : "ml-0"
      )}
    >
      {children}
    </main>
  );
}

