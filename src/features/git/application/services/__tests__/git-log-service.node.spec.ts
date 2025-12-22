import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { getCommitHistory } from '../git-log-service';
import { getLog } from '@/features/shared/infra/clients/git-client';
import { Repository } from '@/features/repository/domain/models/repository';
import type { ReadCommitResult } from 'isomorphic-git';
import type { GitLogError } from '@/features/git/domain/services/git-log-error';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  getLog: vi.fn(),
}));

describe('getCommitHistory', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  const mockCommits: ReadCommitResult[] = [
    {
      oid: 'abc123',
      commit: {
        message: 'feat: add new feature',
        tree: 'tree123',
        author: {
          name: 'Test User',
          email: 'test@example.com',
          timestamp: 1234567890,
          timezoneOffset: 0,
        },
        committer: {
          name: 'Test User',
          email: 'test@example.com',
          timestamp: 1234567890,
          timezoneOffset: 0,
        },
        parent: [],
      },
      payload: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('リポジトリが存在し、コミット履歴取得が成功する場合、Rightを返す', async () => {
    const limit = 10;
    vi.mocked(getLog).mockResolvedValueOnce(mockCommits);

    const result = await getCommitHistory(mockRepository, limit)();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(mockCommits);
    }
    expect(getLog).toHaveBeenCalledWith(mockRepository, limit);
    expect(getLog).toHaveBeenCalledTimes(1);
  });

  it('limitが指定されていない場合、デフォルト値10を使用する', async () => {
    vi.mocked(getLog).mockResolvedValueOnce(mockCommits);

    const result = await getCommitHistory(mockRepository)();

    expect(E.isRight(result)).toBe(true);
    expect(getLog).toHaveBeenCalledWith(mockRepository, 10);
  });

  it('リポジトリがundefinedの場合、REPOSITORY_NOT_FOUNDエラーを返す', async () => {
    const limit = 10;

    const result = await getCommitHistory(undefined, limit)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      expect(result.left.message).toBe('Repository is not found');
    }
    expect(getLog).not.toHaveBeenCalled();
  });

  it('Git操作が失敗した場合、GIT_LOG_ERRORを返す', async () => {
    const limit = 10;
    const error = new Error('Git log failed');
    vi.mocked(getLog).mockRejectedValueOnce(error);

    const result = await getCommitHistory(mockRepository, limit)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('GIT_LOG_ERROR');
      expect(result.left.message).toContain('Failed to get commit history');
    }
    expect(getLog).toHaveBeenCalledWith(mockRepository, limit);
  });

  it('予期しないエラーが発生した場合、UNKNOWN_ERRORを返す', async () => {
    const limit = 10;
    const error = 'Unexpected error';
    vi.mocked(getLog).mockRejectedValueOnce(error);

    const result = await getCommitHistory(mockRepository, limit)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('UNKNOWN_ERROR');
      expect(result.left.message).toBe('An unknown error occurred while getting commit history');
    }
    expect(getLog).toHaveBeenCalledWith(mockRepository, limit);
  });
});

