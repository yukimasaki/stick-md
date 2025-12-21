import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { createRepositoryStore } from '@/features/repository/application/stores/repository-store';
import { Repository } from '@/features/repository/domain/models/repository';
import type { PersistenceService } from '@/features/repository/domain/services/persistence-service';
import type { PersistedRepositoryState } from '@/features/repository/domain/services/persistence-service';

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

  describe('with persistence service', () => {
    let mockPersistenceService: PersistenceService;

    beforeEach(() => {
      mockPersistenceService = {
        save: vi.fn(() => E.right(undefined)),
        load: vi.fn(() => E.right(O.none)),
        clear: vi.fn(() => E.right(undefined))
      };
      store = createRepositoryStore(mockPersistenceService);
    });

    it('should save state when repository is selected', () => {
      store.setRepositories(mockRepos);
      
      store.selectRepository('1');
      
      expect(mockPersistenceService.save).toHaveBeenCalledWith({
        selectedRepositoryId: '1'
      });
    });

    it('should save null when repository is deselected', () => {
      store.setRepositories(mockRepos);
      store.selectRepository('1');
      
      store.selectRepository(null);
      
      expect(mockPersistenceService.save).toHaveBeenCalledWith({
        selectedRepositoryId: null
      });
    });

    it('should restore state from persistence service on initialize', () => {
      const persistedState: PersistedRepositoryState = {
        selectedRepositoryId: '1'
      };
      (mockPersistenceService.load as ReturnType<typeof vi.fn>).mockReturnValue(
        E.right(O.some(persistedState))
      );
      store.setRepositories(mockRepos);
      
      store.initialize();
      
      expect(mockPersistenceService.load).toHaveBeenCalled();
      expect(store.getSnapshot().selectedRepositoryId).toBe('1');
    });

    it('should not restore state when persistence service returns None', () => {
      (mockPersistenceService.load as ReturnType<typeof vi.fn>).mockReturnValue(
        E.right(O.none)
      );
      store.setRepositories(mockRepos);
      
      store.initialize();
      
      expect(mockPersistenceService.load).toHaveBeenCalled();
      expect(store.getSnapshot().selectedRepositoryId).toBe(null);
    });

    it('should handle persistence service load error gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (mockPersistenceService.load as ReturnType<typeof vi.fn>).mockReturnValue(
        E.left({ type: 'STORAGE_UNAVAILABLE', message: 'Storage unavailable' })
      );
      store.setRepositories(mockRepos);
      
      store.initialize();
      
      expect(mockPersistenceService.load).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(store.getSnapshot().selectedRepositoryId).toBe(null);
      consoleErrorSpy.mockRestore();
    });

    it('should handle persistence service save error gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (mockPersistenceService.save as ReturnType<typeof vi.fn>).mockReturnValue(
        E.left({ type: 'STORAGE_UNAVAILABLE', message: 'Storage unavailable' })
      );
      store.setRepositories(mockRepos);
      
      store.selectRepository('1');
      
      expect(mockPersistenceService.save).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(store.getSnapshot().selectedRepositoryId).toBe('1'); // 状態は更新される
      consoleErrorSpy.mockRestore();
    });
  });

  describe('without persistence service', () => {
    it('should work normally without persistence service', () => {
      store = createRepositoryStore();
      store.setRepositories(mockRepos);
      
      store.selectRepository('1');
      
      expect(store.getSnapshot().selectedRepositoryId).toBe('1');
    });

    it('should not crash when initialize is called without persistence service', () => {
      store = createRepositoryStore();
      store.setRepositories(mockRepos);
      
      expect(() => store.initialize()).not.toThrow();
      expect(store.getSnapshot().selectedRepositoryId).toBe(null);
    });
  });
});
