import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as E from 'fp-ts/Either';
import { createMarkdownFile } from './file-creation-service';
import { Repository } from '@/features/repository/domain/models/repository';
import * as gitClient from '@/features/shared/infra/clients/git-client';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  isRepositoryCloned: vi.fn(),
  getRepositoryTree: vi.fn(),
  ensureDirectoryExists: vi.fn(),
  createFile: vi.fn(),
}));

describe('createMarkdownFile', () => {
  const mockRepository: Repository = {
    id: '1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('リポジトリがクローンされていない場合', () => {
    it('REPOSITORY_NOT_FOUNDエラーを返す', async () => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(false);

      const result = await createMarkdownFile(mockRepository, '', 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      }
    });
  });

  describe('ファイル名のバリデーション', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
    });

    it('無効な文字が含まれるファイル名でVALIDATION_ERRORを返す', async () => {
      const result = await createMarkdownFile(mockRepository, '', 'test/file.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('VALIDATION_ERROR');
      }
    });

    it('空のファイル名でVALIDATION_ERRORを返す', async () => {
      const result = await createMarkdownFile(mockRepository, '', '');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('重複ファイルチェック', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
    });

    it('既存ファイルと重複する場合FILE_ALREADY_EXISTSエラーを返す', async () => {
      vi.mocked(gitClient.getRepositoryTree).mockResolvedValue([
        { path: 'test.md', type: 'file' },
        { path: 'src', type: 'directory' },
      ]);

      const result = await createMarkdownFile(mockRepository, '', 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_ALREADY_EXISTS');
        expect(result.left.filePath).toBe('test.md');
      }
    });

    it('既存ファイルと重複しない場合は成功', async () => {
      vi.mocked(gitClient.getRepositoryTree).mockResolvedValue([
        { path: 'other.md', type: 'file' },
      ]);
      vi.mocked(gitClient.createFile).mockResolvedValue(undefined);

      const result = await createMarkdownFile(mockRepository, '', 'test.md');

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe('test.md');
      }
    });
  });

  describe('ディレクトリの自動作成', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
      vi.mocked(gitClient.getRepositoryTree).mockResolvedValue([]);
    });

    it('directoryPathが指定されている場合、ディレクトリを作成する', async () => {
      vi.mocked(gitClient.ensureDirectoryExists).mockResolvedValue(undefined);
      vi.mocked(gitClient.createFile).mockResolvedValue(undefined);

      const result = await createMarkdownFile(mockRepository, 'dir', 'test.md');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.ensureDirectoryExists).toHaveBeenCalledWith(
        mockRepository,
        'dir'
      );
      expect(gitClient.createFile).toHaveBeenCalledWith(
        mockRepository,
        'dir/test.md',
        ''
      );
    });

    it('directoryPathが指定されている場合、正しくディレクトリが作成される', async () => {
      vi.mocked(gitClient.ensureDirectoryExists).mockResolvedValue(undefined);
      vi.mocked(gitClient.createFile).mockResolvedValue(undefined);

      const result = await createMarkdownFile(mockRepository, 'src/components', 'test.md');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.ensureDirectoryExists).toHaveBeenCalledWith(
        mockRepository,
        'src/components'
      );
      expect(gitClient.createFile).toHaveBeenCalledWith(
        mockRepository,
        'src/components/test.md',
        ''
      );
    });

    it('ディレクトリ作成に失敗した場合DIRECTORY_CREATION_FAILEDエラーを返す', async () => {
      vi.mocked(gitClient.ensureDirectoryExists).mockRejectedValue(
        new Error('Directory creation failed')
      );

      const result = await createMarkdownFile(mockRepository, 'dir', 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('DIRECTORY_CREATION_FAILED');
        expect(result.left.directoryPath).toBe('dir');
      }
    });
  });

  describe('ファイル作成', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
      vi.mocked(gitClient.getRepositoryTree).mockResolvedValue([]);
    });

    it('ファイル作成に成功した場合、ファイルパスを返す', async () => {
      vi.mocked(gitClient.createFile).mockResolvedValue(undefined);

      const result = await createMarkdownFile(mockRepository, '', 'test.md');

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe('test.md');
      }
      expect(gitClient.createFile).toHaveBeenCalledWith(
        mockRepository,
        'test.md',
        ''
      );
    });

    it('ファイル作成に失敗した場合FILE_CREATION_FAILEDエラーを返す', async () => {
      vi.mocked(gitClient.createFile).mockRejectedValue(new Error('File creation failed'));

      const result = await createMarkdownFile(mockRepository, '', 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_CREATION_FAILED');
        expect(result.left.filePath).toBe('test.md');
      }
    });
  });

  describe('パス正規化', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
      vi.mocked(gitClient.getRepositoryTree).mockResolvedValue([]);
      vi.mocked(gitClient.createFile).mockResolvedValue(undefined);
    });

    it('directoryPathが空文字列の場合、ルートに作成する', async () => {
      const result = await createMarkdownFile(mockRepository, '', 'test.md');

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.createFile).toHaveBeenCalledWith(
        mockRepository,
        'test.md',
        ''
      );
    });
  });

  describe('エラーハンドリング', () => {
    beforeEach(() => {
      vi.mocked(gitClient.isRepositoryCloned).mockResolvedValue(true);
    });

    it('予期しないエラーが発生した場合UNKNOWN_ERRORを返す', async () => {
      vi.mocked(gitClient.getRepositoryTree).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await createMarkdownFile(mockRepository, '', 'test.md');

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('UNKNOWN_ERROR');
      }
    });
  });
});

