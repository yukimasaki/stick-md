import { Repository } from '@/features/repository/domain/models/repository';

interface RepositoryState {
  repositories: Repository[];
  selectedRepositoryId: string | null;
  isLoading: boolean;
}

type Listener = () => void;

export const createRepositoryStore = () => {
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

  const selectRepository = (id: string) => {
    state = {
      ...state,
      selectedRepositoryId: id
    };
    notify();
  };

  const setLoading = (loading: boolean) => {
    state = {
      ...state,
      isLoading: loading
    };
    notify();
  };

  return {
    getSnapshot,
    subscribe,
    setRepositories,
    selectRepository,
    setLoading
  };
};

export const repositoryStore = createRepositoryStore();
