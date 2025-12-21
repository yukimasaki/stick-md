'use client';

import { useEffect } from 'react';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';
import { ReactNode } from 'react';

interface RepositoryProviderProps {
  children: ReactNode;
}

export function RepositoryProvider({ children }: RepositoryProviderProps) {
  useEffect(() => {
    // ストアの初期化（LocalStorageから読み込み）
    repositoryStore.initialize();
  }, []);

  return <>{children}</>;
}

