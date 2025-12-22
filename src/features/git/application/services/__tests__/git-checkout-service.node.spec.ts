import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { discardFileChanges } from '../git-checkout-service';
import { getStatus, checkoutFile, deleteFile } from '@/features/shared/infra/clients/git-client';
import { Repository } from '@/features/repository/domain/models/repository';
import type { StatusResult } from '@/features/shared/infra/clients/git-client';
import type { GitCheckoutError } from '@/features/git/domain/services/git-checkout-error';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  getStatus: vi.fn(),
  checkoutFile: vi.fn(),
  deleteFile: vi.fn(),
}));

describe('discardFileChanges', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('リポジトリが存在し、既存ファイルの変更を破棄する場合、Rightを返す', async () => {
    const filePath = 'test.md';
    const statusMatrix: StatusResult = [
      [filePath, 1, 2, 1], // 既存ファイル（headStatus=1）
    ];
    vi.mocked(getStatus).mockResolvedValueOnce(statusMatrix);
    vi.mocked(checkoutFile).mockResolvedValueOnce(undefined);

    const result = await discardFileChanges(mockRepository, filePath)();

    expect(E.isRight(result)).toBe(true);
    expect(getStatus).toHaveBeenCalledWith(mockRepository);
    expect(checkoutFile).toHaveBeenCalledWith(mockRepository, filePath);
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it('リポジトリが存在し、新規ファイルを削除する場合、Rightを返す', async () => {
    const filePath = 'new-file.md';
    const statusMatrix: StatusResult = [
      [filePath, 0, 2, 0], // 新規ファイル（headStatus=0）
    ];
    vi.mocked(getStatus).mockResolvedValueOnce(statusMatrix);
    vi.mocked(deleteFile).mockResolvedValueOnce(undefined);

    const result = await discardFileChanges(mockRepository, filePath)();

    expect(E.isRight(result)).toBe(true);
    expect(getStatus).toHaveBeenCalledWith(mockRepository);
    expect(deleteFile).toHaveBeenCalledWith(mockRepository, filePath);
    expect(checkoutFile).not.toHaveBeenCalled();
  });

  it('リポジトリがundefinedの場合、REPOSITORY_NOT_FOUNDエラーを返す', async () => {
    const filePath = 'test.md';

    const result = await discardFileChanges(undefined, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      expect(result.left.message).toBe('Repository is not found');
    }
    expect(getStatus).not.toHaveBeenCalled();
  });

  it('ファイルがステータスに存在しない場合、FILE_NOT_FOUNDエラーを返す', async () => {
    const filePath = 'nonexistent.md';
    const statusMatrix: StatusResult = [];
    vi.mocked(getStatus).mockResolvedValueOnce(statusMatrix);

    const result = await discardFileChanges(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('FILE_NOT_FOUND');
      expect(result.left.message).toBe(`File not found in git status: ${filePath}`);
      expect(result.left.filePath).toBe(filePath);
    }
    expect(getStatus).toHaveBeenCalledWith(mockRepository);
    expect(checkoutFile).not.toHaveBeenCalled();
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it('ステータス取得が失敗した場合、GIT_CHECKOUT_ERRORを返す', async () => {
    const filePath = 'test.md';
    const error = new Error('Failed to get file status');
    vi.mocked(getStatus).mockRejectedValueOnce(error);

    const result = await discardFileChanges(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('GIT_CHECKOUT_ERROR');
      expect(result.left.message).toContain('Failed to get file status');
      expect(result.left.filePath).toBe(filePath);
    }
    expect(getStatus).toHaveBeenCalledWith(mockRepository);
  });

  it('既存ファイルのcheckoutが失敗した場合、GIT_CHECKOUT_ERRORを返す', async () => {
    const filePath = 'test.md';
    const statusMatrix: StatusResult = [
      [filePath, 1, 2, 1], // 既存ファイル
    ];
    vi.mocked(getStatus).mockResolvedValueOnce(statusMatrix);
    const error = new Error('ENOENT: no such file or directory');
    vi.mocked(checkoutFile).mockRejectedValueOnce(error);

    const result = await discardFileChanges(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('FILE_NOT_FOUND');
      expect(result.left.message).toBe(`File not found: ${filePath}`);
      expect(result.left.filePath).toBe(filePath);
    }
    expect(checkoutFile).toHaveBeenCalledWith(mockRepository, filePath);
  });

  it('新規ファイルの削除が失敗した場合、GIT_CHECKOUT_ERRORを返す', async () => {
    const filePath = 'new-file.md';
    const statusMatrix: StatusResult = [
      [filePath, 0, 2, 0], // 新規ファイル
    ];
    vi.mocked(getStatus).mockResolvedValueOnce(statusMatrix);
    const error = new Error('ENOENT: no such file or directory');
    vi.mocked(deleteFile).mockRejectedValueOnce(error);

    const result = await discardFileChanges(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('FILE_NOT_FOUND');
      expect(result.left.message).toBe(`File not found: ${filePath}`);
      expect(result.left.filePath).toBe(filePath);
    }
    expect(deleteFile).toHaveBeenCalledWith(mockRepository, filePath);
  });

  it('予期しないエラーが発生した場合、UNKNOWN_ERRORを返す', async () => {
    const filePath = 'test.md';
    const statusMatrix: StatusResult = [
      [filePath, 1, 2, 1], // 既存ファイル
    ];
    vi.mocked(getStatus).mockResolvedValueOnce(statusMatrix);
    const error = 'Unexpected error';
    vi.mocked(checkoutFile).mockRejectedValueOnce(error);

    const result = await discardFileChanges(mockRepository, filePath)();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('UNKNOWN_ERROR');
      expect(result.left.message).toBe('An unknown error occurred while checking out file');
    }
    expect(checkoutFile).toHaveBeenCalledWith(mockRepository, filePath);
  });
});

