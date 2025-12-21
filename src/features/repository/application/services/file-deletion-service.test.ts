import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as E from 'fp-ts/Either';
import { deleteFileOrDirectory } from './file-deletion-service';
import { Repository } from '@/features/repository/domain/models/repository';
import * as gitClient from '@/features/repository/infra/clients/git-client';
import LightningFS from '@isomorphic-git/lightning-fs';

// git-clientをモック
vi.mock('@/features/repository/infra/clients/git-client', () => ({
  isRepositoryCloned: vi.fn(),
  getFileSystem: vi.fn(),
  getRepositoryPath: vi.fn(),
  deleteFile: vi.fn(),
  deleteDirectory: vi.fn(),
}));

describe('deleteFileOrDirectory', () => {
  const mockRepository: Repository = {
    id: '1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  let mockFs: {
    promises: {
      stat: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // LightningFSのモック
    mockFs = {
      promises: {
        stat: vi.fn(),
      },
    };

    vi.mocked(gitClient.getFileSystem).mockReturnValue(mockFs as unknown as LightningFS);
    vi.mocked(gitClient.getRepositoryPath).mockReturnValue('/repos/user/test-repo');
  });

  describe('リポジトリがクローンされていない場合', () => {
    it('REPOSITORY_NOT_FOUNDエラーを返す', async () => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(false);

      const result = await deleteFileOrDirectory(mockRepository, 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
        expect(result.left.message).toBe('Repository is not cloned');
      }
    });
  });

  describe('ファイルの削除', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
    });

    it('ファイルが存在する場合、ファイルを削除する', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => false,
      });
      vi.mocked(gitClient.deleteFile).mockResolvedValue(undefined);

      const result = await deleteFileOrDirectory(mockRepository, 'test.md');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.deleteFile).toHaveBeenCalledWith(mockRepository, 'test.md');
    });

    it('ファイル削除に失敗した場合FILE_SYSTEM_ERRORを返す', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => false,
      });
      vi.mocked(gitClient.deleteFile).mockRejectedValue(new Error('Delete failed'));

      const result = await deleteFileOrDirectory(mockRepository, 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_SYSTEM_ERROR');
        expect(result.left.message).toBe('Failed to delete file: test.md');
        expect(result.left.filePath).toBe('test.md');
      }
    });
  });

  describe('ディレクトリの削除', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
    });

    it('ディレクトリが存在する場合、ディレクトリを削除する', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => true,
      });
      vi.mocked(gitClient.deleteDirectory).mockResolvedValue(undefined);

      const result = await deleteFileOrDirectory(mockRepository, 'src');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.deleteDirectory).toHaveBeenCalledWith(mockRepository, 'src');
    });

    it('ディレクトリ削除に失敗した場合FILE_SYSTEM_ERRORを返す', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => true,
      });
      vi.mocked(gitClient.deleteDirectory).mockRejectedValue(new Error('Delete failed'));

      const result = await deleteFileOrDirectory(mockRepository, 'src');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_SYSTEM_ERROR');
        expect(result.left.message).toBe('Failed to delete directory: src');
        expect(result.left.filePath).toBe('src');
      }
    });
  });

  describe('パス正規化', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
    });

    it('先頭にスラッシュがあるパスを正規化する', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => false,
      });
      vi.mocked(gitClient.deleteFile).mockResolvedValue(undefined);

      const result = await deleteFileOrDirectory(mockRepository, '/test.md');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.deleteFile).toHaveBeenCalledWith(mockRepository, 'test.md');
    });

    it('末尾にスラッシュがあるパスを正規化する', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => true,
      });
      vi.mocked(gitClient.deleteDirectory).mockResolvedValue(undefined);

      const result = await deleteFileOrDirectory(mockRepository, 'src/');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.deleteDirectory).toHaveBeenCalledWith(mockRepository, 'src');
    });

    it('先頭と末尾にスラッシュがあるパスを正規化する', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => false,
      });
      vi.mocked(gitClient.deleteFile).mockResolvedValue(undefined);

      const result = await deleteFileOrDirectory(mockRepository, '/test.md/');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.deleteFile).toHaveBeenCalledWith(mockRepository, 'test.md');
    });

    it('空文字列のパスを正規化する', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => false,
      });
      vi.mocked(gitClient.deleteFile).mockResolvedValue(undefined);

      const result = await deleteFileOrDirectory(mockRepository, '');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.deleteFile).toHaveBeenCalledWith(mockRepository, '');
    });

    it('スラッシュのみのパスを正規化する', async () => {
      mockFs.promises.stat.mockResolvedValue({
        isDirectory: () => true,
      });
      vi.mocked(gitClient.deleteDirectory).mockResolvedValue(undefined);

      const result = await deleteFileOrDirectory(mockRepository, '/');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.deleteDirectory).toHaveBeenCalledWith(mockRepository, '');
    });
  });

  describe('ファイル/ディレクトリが存在しない場合', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
    });

    it('ENOENTエラーの場合FILE_NOT_FOUNDを返す', async () => {
      const error = new Error('ENOENT: no such file or directory');
      mockFs.promises.stat.mockRejectedValue(error);

      const result = await deleteFileOrDirectory(mockRepository, 'nonexistent.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_NOT_FOUND');
        expect(result.left.message).toBe('File or directory not found: nonexistent.md');
        expect(result.left.filePath).toBe('nonexistent.md');
      }
    });

    it('エラーメッセージにENOENTが含まれる場合FILE_NOT_FOUNDを返す', async () => {
      const error = new Error('Error: ENOENT');
      mockFs.promises.stat.mockRejectedValue(error);

      const result = await deleteFileOrDirectory(mockRepository, 'nonexistent.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_NOT_FOUND');
      }
    });
  });

  describe('予期しないエラー', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
    });

    it('Errorオブジェクトでないエラーの場合UNKNOWN_ERRORを返す', async () => {
      mockFs.promises.stat.mockRejectedValue('String error');

      const result = await deleteFileOrDirectory(mockRepository, 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('UNKNOWN_ERROR');
        expect(result.left.message).toBe('Unknown error occurred');
      }
    });

    it('ENOENT以外のErrorオブジェクトの場合UNKNOWN_ERRORを返す', async () => {
      const error = new Error('Permission denied');
      mockFs.promises.stat.mockRejectedValue(error);

      const result = await deleteFileOrDirectory(mockRepository, 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('UNKNOWN_ERROR');
        expect(result.left.message).toBe('Permission denied');
      }
    });
  });
});

