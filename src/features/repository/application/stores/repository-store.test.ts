import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRepositoryStore } from '@/features/repository/application/stores/repository-store';
import { Repository } from '@/features/repository/domain/models/repository';

describe('RepositoryStore', () => {
  let store: ReturnType<typeof createRepositoryStore>;

  const mockRepos: Repository[] = [
    { id: '1', name: 'repo-1', full_name: 'user/repo-1', private: false },
    { id: '2', name: 'repo-2', full_name: 'user/repo-2', private: true },
  ];

  beforeEach(() => {
    store = createRepositoryStore();
  });

  it('should verify initial state with getSnapshot', () => {
    const snapshot = store.getSnapshot();
    expect(snapshot).toEqual({
      repositories: [],
      selectedRepositoryId: null,
      isLoading: false
    });
  });

  it('should update state and notify listeners when repositories are loaded', () => {
    const listener = vi.fn();
    store.subscribe((listener));

    store.setRepositories(mockRepos);

    expect(listener).toHaveBeenCalled();
    const snapshot = store.getSnapshot();
    expect(snapshot.repositories).toEqual(mockRepos);
    expect(snapshot.isLoading).toBe(false);
  });

  it('should select a repository', () => {
    store.setRepositories(mockRepos);
    const listener = vi.fn();
    store.subscribe((listener));
    
    store.selectRepository('1');
    
    expect(listener).toHaveBeenCalled();
    expect(store.getSnapshot().selectedRepositoryId).toBe('1');
  });
});
