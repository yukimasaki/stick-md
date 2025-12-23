import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDisplayRepository, checkRepositoryCloned, type RepositorySelectionState } from './repository-selection-service';
import { Repository } from '@/features/repository/domain/models/repository';
import * as gitClient from '@/features/shared/infra/clients/git-client';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  isRepositoryCloned: vi.fn(),
}));

describe('getDisplayRepository', () => {
  const mockRepositories: Repository[] = [
    { id: '1', name: 'repo-1', full_name: 'user/repo-1', private: false },
    { id: '2', name: 'repo-2', full_name: 'user/repo-2', private: false },
    { id: '3', name: 'repo-3', full_name: 'user/repo-3', private: false },
  ];

  it('should return pending repository when pendingRepositoryId is set', () => {
    const state: RepositorySelectionState = {
      selectedRepositoryId: '1',
      pendingRepositoryId: '2',
    };
    const result = getDisplayRepository(mockRepositories, state);
    expect(result).toEqual(mockRepositories[1]);
  });

  it('should return selected repository when pendingRepositoryId is null', () => {
    const state: RepositorySelectionState = {
      selectedRepositoryId: '1',
      pendingRepositoryId: null,
    };
    const result = getDisplayRepository(mockRepositories, state);
    expect(result).toEqual(mockRepositories[0]);
  });

  it('should return selected repository when pendingRepositoryId is not set', () => {
    const state: RepositorySelectionState = {
      selectedRepositoryId: '3',
      pendingRepositoryId: null,
    };
    const result = getDisplayRepository(mockRepositories, state);
    expect(result).toEqual(mockRepositories[2]);
  });

  it('should return null when both selectedRepositoryId and pendingRepositoryId are null', () => {
    const state: RepositorySelectionState = {
      selectedRepositoryId: null,
      pendingRepositoryId: null,
    };
    const result = getDisplayRepository(mockRepositories, state);
    expect(result).toBeNull();
  });

  it('should return null when repository is not found', () => {
    const state: RepositorySelectionState = {
      selectedRepositoryId: '999',
      pendingRepositoryId: null,
    };
    const result = getDisplayRepository(mockRepositories, state);
    expect(result).toBeNull();
  });

  it('should prioritize pendingRepositoryId over selectedRepositoryId', () => {
    const state: RepositorySelectionState = {
      selectedRepositoryId: '1',
      pendingRepositoryId: '3',
    };
    const result = getDisplayRepository(mockRepositories, state);
    expect(result).toEqual(mockRepositories[2]);
    expect(result).not.toEqual(mockRepositories[0]);
  });

  it('should handle empty repository array', () => {
    const state: RepositorySelectionState = {
      selectedRepositoryId: '1',
      pendingRepositoryId: null,
    };
    const result = getDisplayRepository([], state);
    expect(result).toBeNull();
  });
});

describe('checkRepositoryCloned', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when repository is null', async () => {
    const result = await checkRepositoryCloned(null);
    expect(result).toBe(false);
    expect(gitClient.isRepositoryCloned).not.toHaveBeenCalled();
  });

  it('should return true when repository is cloned', async () => {
    const repository: Repository = {
      id: '1',
      name: 'repo-1',
      full_name: 'user/repo-1',
      private: false,
    };
    vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);

    const result = await checkRepositoryCloned(repository);
    expect(result).toBe(true);
    expect(gitClient.isRepositoryCloned).toHaveBeenCalledWith(repository);
  });

  it('should return false when repository is not cloned', async () => {
    const repository: Repository = {
      id: '1',
      name: 'repo-1',
      full_name: 'user/repo-1',
      private: false,
    };
    vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(false);

    const result = await checkRepositoryCloned(repository);
    expect(result).toBe(false);
    expect(gitClient.isRepositoryCloned).toHaveBeenCalledWith(repository);
  });

  it('should return false and log error when isRepositoryCloned throws', async () => {
    const repository: Repository = {
      id: '1',
      name: 'repo-1',
      full_name: 'user/repo-1',
      private: false,
    };
    const error = new Error('Failed to check');
    vi.mocked(gitClient.isRepositoryCloned).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await checkRepositoryCloned(repository);
    expect(result).toBe(false);
    expect(gitClient.isRepositoryCloned).toHaveBeenCalledWith(repository);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to check repository clone status:', error);

    consoleSpy.mockRestore();
  });
});

