import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as E from 'fp-ts/Either';
import { addFileToStage } from '../git-add-service';
import { addFile } from '@/features/shared/infra/clients/git-client';
import { Repository } from '@/features/repository/domain/models/repository';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  addFile: vi.fn(),
}));

describe('addFileToStage', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('リポジトリが存在し、ファイル追加が成功する場合、Rightを返す', async () => {
    const filePath = 'test.md';
    vi.mocked(addFile).mockResolvedValueOnce(undefined);

    const result = await addFileToStage(mockRepository, filePath)();

    expect(E.isRight(result)).toBe(true);
    expect(addFile).toHaveBeenCalledWith(mockRepository, filePath);
    expect(addFile).toHaveBeenCalledTimes(1);
  });

  it('リポジトリがundefinedの場合、REPOSITORY_NOT_FOUNDエラーを返す', async () => {
    const filePath = 'test.md';

    const result = await addFileToStage(undefined, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      expect(result.left.message).toBe('Repository is not found');
    }
    expect(addFile).not.toHaveBeenCalled();
  });

  it('ファイルが見つからない場合、FILE_NOT_FOUNDエラーを返す', async () => {
    const filePath = 'nonexistent.md';
    const error = new Error('ENOENT: no such file or directory');
    vi.mocked(addFile).mockRejectedValueOnce(error);

    const result = await addFileToStage(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result) && result.left.type === 'FILE_NOT_FOUND') {
      expect(result.left.message).toBe(`File not found: ${filePath}. The file may have been deleted.`);
      expect(result.left.filePath).toBe(filePath);
    }
    expect(addFile).toHaveBeenCalledWith(mockRepository, filePath);
  });

  it('Git操作が失敗した場合、GIT_ADD_ERRORを返す', async () => {
    const filePath = 'test.md';
    const error = new Error('Git add failed');
    vi.mocked(addFile).mockRejectedValueOnce(error);

    const result = await addFileToStage(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result) && result.left.type === 'GIT_ADD_ERROR') {
      expect(result.left.message).toContain('Failed to add file to stage');
      expect(result.left.filePath).toBe(filePath);
    }
    expect(addFile).toHaveBeenCalledWith(mockRepository, filePath);
  });

  it('予期しないエラーが発生した場合、UNKNOWN_ERRORを返す', async () => {
    const filePath = 'test.md';
    const error = 'Unexpected error';
    vi.mocked(addFile).mockRejectedValueOnce(error);

    const result = await addFileToStage(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('UNKNOWN_ERROR');
      expect(result.left.message).toBe('An unknown error occurred while adding file to stage');
    }
    expect(addFile).toHaveBeenCalledWith(mockRepository, filePath);
  });
});

