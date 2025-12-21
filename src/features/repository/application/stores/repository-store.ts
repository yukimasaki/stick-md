import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import type { PersistenceService } from '@/features/repository/domain/services/persistence-service';

interface RepositoryState {
  repositories: Repository[];
  selectedRepositoryId: string | null;
  isLoading: boolean;
}

type Listener = () => void;

export const createRepositoryStore = (persistenceService?: PersistenceService) => {
  let state: RepositoryState = {
    repositories: [],
    selectedRepositoryId: null,
    isLoading: false
  };

  const listeners: Set<Listener> = new Set();

  const getSnapshot = () => state;

  const subscribe = (listener: Listener): () => void => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const notify = () => {
    listeners.forEach(listener => listener());
  };

  const setRepositories = (repos: Repository[]) => {
    state = {
      ...state,
      repositories: repos,
      isLoading: false
    };
    notify();
  };

  const selectRepository = (id: string | null) => {
    state = {
      ...state,
      selectedRepositoryId: id
    };
    notify();

    // 永続化（副作用を分離）
    if (persistenceService) {
      pipe(
        { selectedRepositoryId: id },
        persistenceService.save,
        E.fold(
          (error) => console.error('Failed to save state:', error),
          () => {} // 成功時は何もしない
        )
      );
    }
  };

  const setLoading = (loading: boolean) => {
    state = {
      ...state,
      isLoading: loading
    };
    notify();
  };

  const initialize = () => {
    if (persistenceService) {
      pipe(
        persistenceService.load(),
        E.fold(
          (error) => console.error('Failed to load state:', error),
          (maybeState) =>
            pipe(
              maybeState,
              O.fold(
                () => {}, // 保存された状態がない場合
                (persistedState) => {
                  state = {
                    ...state,
                    selectedRepositoryId: persistedState.selectedRepositoryId
                  };
                  notify();
                }
              )
            )
        )
      );
    }
  };

  return {
    getSnapshot,
    subscribe,
    setRepositories,
    selectRepository,
    setLoading,
    initialize
  };
};

import { createLocalStoragePersistenceService } from '@/features/repository/infra/storage/local-storage-persistence-service';

// 永続化サービスを注入してストアを作成
const persistenceService = createLocalStoragePersistenceService();
export const repositoryStore = createRepositoryStore(persistenceService);
