import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as E from 'fp-ts/Either';
import { commitChanges } from '../git-commit-service';
import { commit } from '@/features/shared/infra/clients/git-client';
import { Repository } from '@/features/repository/domain/models/repository';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  commit: vi.fn(),
}));

describe('commitChanges', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  const mockSessionUser = {
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('リポジトリが存在し、コミットメッセージとステージ済みファイルが有効な場合、Rightを返す', async () => {
    const message = 'feat: add new feature';
    const stagedFiles = ['file1.md', 'file2.md'];
    const commitSha = 'abc123';
    vi.mocked(commit).mockResolvedValueOnce(commitSha);

    const result = await commitChanges(mockRepository, message, stagedFiles, mockSessionUser)();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(commitSha);
    }
    expect(commit).toHaveBeenCalledWith(mockRepository, message, {
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it('リポジトリがundefinedの場合、REPOSITORY_NOT_FOUNDエラーを返す', async () => {
    const message = 'feat: add new feature';
    const stagedFiles = ['file1.md'];

    const result = await commitChanges(undefined, message, stagedFiles, mockSessionUser)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      expect(result.left.message).toBe('Repository is not found');
    }
    expect(commit).not.toHaveBeenCalled();
  });

  it('コミットメッセージが空の場合、EMPTY_COMMIT_MESSAGEエラーを返す', async () => {
    const message = '';
    const stagedFiles = ['file1.md'];

    const result = await commitChanges(mockRepository, message, stagedFiles, mockSessionUser)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('EMPTY_COMMIT_MESSAGE');
      expect(result.left.message).toBe('Commit message cannot be empty');
    }
    expect(commit).not.toHaveBeenCalled();
  });

  it('コミットメッセージが空白のみの場合、EMPTY_COMMIT_MESSAGEエラーを返す', async () => {
    const message = '   ';
    const stagedFiles = ['file1.md'];

    const result = await commitChanges(mockRepository, message, stagedFiles, mockSessionUser)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('EMPTY_COMMIT_MESSAGE');
      expect(result.left.message).toBe('Commit message cannot be empty');
    }
    expect(commit).not.toHaveBeenCalled();
  });

  it('ステージ済みファイルが空の場合、NO_STAGED_FILESエラーを返す', async () => {
    const message = 'feat: add new feature';
    const stagedFiles: string[] = [];

    const result = await commitChanges(mockRepository, message, stagedFiles, mockSessionUser)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('NO_STAGED_FILES');
      expect(result.left.message).toBe('No staged files to commit');
    }
    expect(commit).not.toHaveBeenCalled();
  });

  it('セッション情報がない場合、GIT_COMMIT_ERRORを返す', async () => {
    const message = 'feat: add new feature';
    const stagedFiles = ['file1.md'];

    const result = await commitChanges(mockRepository, message, stagedFiles, undefined)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('GIT_COMMIT_ERROR');
      expect(result.left.message).toBe('User information is not available. Please log in again.');
    }
    expect(commit).not.toHaveBeenCalled();
  });

  it('セッションのnameがない場合、GIT_COMMIT_ERRORを返す', async () => {
    const message = 'feat: add new feature';
    const stagedFiles = ['file1.md'];
    const sessionUserWithoutName = {
      email: 'test@example.com',
    };

    const result = await commitChanges(mockRepository, message, stagedFiles, sessionUserWithoutName)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('GIT_COMMIT_ERROR');
      expect(result.left.message).toBe('User information is not available. Please log in again.');
    }
    expect(commit).not.toHaveBeenCalled();
  });

  it('セッションのemailがない場合、GIT_COMMIT_ERRORを返す', async () => {
    const message = 'feat: add new feature';
    const stagedFiles = ['file1.md'];
    const sessionUserWithoutEmail = {
      name: 'Test User',
    };

    const result = await commitChanges(mockRepository, message, stagedFiles, sessionUserWithoutEmail)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('GIT_COMMIT_ERROR');
      expect(result.left.message).toBe('User information is not available. Please log in again.');
    }
    expect(commit).not.toHaveBeenCalled();
  });

  it('Git操作が失敗した場合、GIT_COMMIT_ERRORを返す', async () => {
    const message = 'feat: add new feature';
    const stagedFiles = ['file1.md'];
    const error = new Error('Git commit failed');
    vi.mocked(commit).mockRejectedValueOnce(error);

    const result = await commitChanges(mockRepository, message, stagedFiles, mockSessionUser)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('GIT_COMMIT_ERROR');
      expect(result.left.message).toContain('Failed to commit');
    }
    expect(commit).toHaveBeenCalledWith(mockRepository, message, {
      name: 'Test User',
      email: 'test@example.com',
    });
  });

  it('予期しないエラーが発生した場合、UNKNOWN_ERRORを返す', async () => {
    const message = 'feat: add new feature';
    const stagedFiles = ['file1.md'];
    const error = 'Unexpected error';
    vi.mocked(commit).mockRejectedValueOnce(error);

    const result = await commitChanges(mockRepository, message, stagedFiles, mockSessionUser)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('UNKNOWN_ERROR');
      expect(result.left.message).toBe('An unknown error occurred while committing');
    }
    expect(commit).toHaveBeenCalledWith(mockRepository, message, {
      name: 'Test User',
      email: 'test@example.com',
    });
  });
});

