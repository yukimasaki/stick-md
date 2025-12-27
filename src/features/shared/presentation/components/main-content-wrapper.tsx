'use client';

import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MainContentWrapperProps {
  children: ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const isMobile = useIsMobile();

  return (
    <main
      className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        isMobile ? "ml-0" : "ml-80" // PC: 常にマージン、モバイル: マージンなし
      )}
    >
      {children}
    </main>
  );
}

