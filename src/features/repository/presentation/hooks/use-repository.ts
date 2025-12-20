'use client';

import { useSyncExternalStore } from 'react';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';

export function useRepository() {
  const store = useSyncExternalStore(
    repositoryStore.subscribe,
    repositoryStore.getSnapshot,
    repositoryStore.getSnapshot
  );

  return {
    ...store,
    actions: {
      setRepositories: repositoryStore.setRepositories,
      selectRepository: repositoryStore.selectRepository,
      setLoading: repositoryStore.setLoading,
    }
  };
}
