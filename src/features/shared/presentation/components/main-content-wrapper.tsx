'use client';

import { ReactNode } from 'react';

interface MainContentWrapperProps {
  children: ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  return (
    <main className="flex-1 overflow-hidden">
      {children}
    </main>
  );
}

