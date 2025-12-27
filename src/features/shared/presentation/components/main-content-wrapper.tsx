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
    <main className={cn(
      'flex-1 overflow-hidden',
      // PC: サイドバーの幅分だけ左マージンを追加（w-80 = 320px）
      !isMobile && 'ml-80'
    )}>
      {children}
    </main>
  );
}

