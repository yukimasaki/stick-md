import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { getRepositoryStatus } from '../git-status-service';
import { getStatus } from '@/features/shared/infra/clients/git-client';
import { Repository } from '@/features/repository/domain/models/repository';
import type { StatusResult } from '@/features/shared/infra/clients/git-client';
import type { GitStatusError } from '@/features/git/domain/services/git-status-error';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  getStatus: vi.fn(),
}));

describe('getRepositoryStatus', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('リポジトリが存在し、ステータス取得が成功する場合、Rightを返す', async () => {
    const statusMatrix: StatusResult = [
      ['file1.md', 0, 2, 2], // ステージ済み
      ['file2.md', 1, 2, 1], // 未ステージ
    ];
    vi.mocked(getStatus).mockResolvedValueOnce(statusMatrix);

    const result = await getRepositoryStatus(mockRepository)();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.staged).toEqual(['file1.md']);
      expect(result.right.unstaged).toEqual(['file2.md']);
    }
    expect(getStatus).toHaveBeenCalledWith(mockRepository);
    expect(getStatus).toHaveBeenCalledTimes(1);
  });

  it('リポジトリがundefinedの場合、REPOSITORY_NOT_FOUNDエラーを返す', async () => {
    const result = await getRepositoryStatus(undefined)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      expect(result.left.message).toBe('Repository is not found');
    }
    expect(getStatus).not.toHaveBeenCalled();
  });

  it('Git操作が失敗した場合、GIT_STATUS_ERRORを返す', async () => {
    const error = new Error('Git status failed');
    vi.mocked(getStatus).mockRejectedValueOnce(error);

    const result = await getRepositoryStatus(mockRepository)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('GIT_STATUS_ERROR');
      expect(result.left.message).toContain('Failed to get git status');
    }
    expect(getStatus).toHaveBeenCalledWith(mockRepository);
  });

  it('予期しないエラーが発生した場合、UNKNOWN_ERRORを返す', async () => {
    const error = 'Unexpected error';
    vi.mocked(getStatus).mockRejectedValueOnce(error);

    const result = await getRepositoryStatus(mockRepository)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('UNKNOWN_ERROR');
      expect(result.left.message).toBe('An unknown error occurred while getting git status');
    }
    expect(getStatus).toHaveBeenCalledWith(mockRepository);
  });
});

