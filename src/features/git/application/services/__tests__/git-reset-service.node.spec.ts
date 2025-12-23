import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as E from 'fp-ts/Either';
import { resetFileFromStage } from '../git-reset-service';
import { resetFile } from '@/features/shared/infra/clients/git-client';
import { Repository } from '@/features/repository/domain/models/repository';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  resetFile: vi.fn(),
}));

describe('resetFileFromStage', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('リポジトリが存在し、ファイルリセットが成功する場合、Rightを返す', async () => {
    const filePath = 'test.md';
    vi.mocked(resetFile).mockResolvedValueOnce(undefined);

    const result = await resetFileFromStage(mockRepository, filePath)();

    expect(E.isRight(result)).toBe(true);
    expect(resetFile).toHaveBeenCalledWith(mockRepository, filePath);
    expect(resetFile).toHaveBeenCalledTimes(1);
  });

  it('リポジトリがundefinedの場合、REPOSITORY_NOT_FOUNDエラーを返す', async () => {
    const filePath = 'test.md';

    const result = await resetFileFromStage(undefined, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      expect(result.left.message).toBe('Repository is not found');
    }
    expect(resetFile).not.toHaveBeenCalled();
  });

  it('ファイルが見つからない場合、FILE_NOT_FOUNDエラーを返す', async () => {
    const filePath = 'nonexistent.md';
    const error = new Error('ENOENT: no such file or directory');
    vi.mocked(resetFile).mockRejectedValueOnce(error);

    const result = await resetFileFromStage(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result) && result.left.type === 'FILE_NOT_FOUND') {
      expect(result.left.message).toBe(`File not found: ${filePath}`);
      expect(result.left.filePath).toBe(filePath);
    }
    expect(resetFile).toHaveBeenCalledWith(mockRepository, filePath);
  });

  it('Git操作が失敗した場合、GIT_RESET_ERRORを返す', async () => {
    const filePath = 'test.md';
    const error = new Error('Git reset failed');
    vi.mocked(resetFile).mockRejectedValueOnce(error);

    const result = await resetFileFromStage(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result) && result.left.type === 'GIT_RESET_ERROR') {
      expect(result.left.message).toContain('Failed to reset file from stage');
      expect(result.left.filePath).toBe(filePath);
    }
    expect(resetFile).toHaveBeenCalledWith(mockRepository, filePath);
  });

  it('予期しないエラーが発生した場合、UNKNOWN_ERRORを返す', async () => {
    const filePath = 'test.md';
    const error = 'Unexpected error';
    vi.mocked(resetFile).mockRejectedValueOnce(error);

    const result = await resetFileFromStage(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('UNKNOWN_ERROR');
      expect(result.left.message).toBe('An unknown error occurred while resetting file from stage');
    }
    expect(resetFile).toHaveBeenCalledWith(mockRepository, filePath);
  });
});

