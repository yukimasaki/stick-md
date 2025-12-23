import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as E from 'fp-ts/Either';
import { saveFile } from './file-save-service';
import type { TabState, Tab } from '@/features/editor/domain/models/tab-state';
import { Repository } from '@/features/repository/domain/models/repository';
import * as gitClient from '@/features/shared/infra/clients/git-client';
import { tabStore } from '@/features/editor/application/stores/tab-store';

// git-clientをモック
vi.mock('@/features/shared/infra/clients/git-client', () => ({
  createFile: vi.fn(),
}));

// tabStoreをモック
vi.mock('@/features/editor/application/stores/tab-store', () => ({
  tabStore: {
    markTabAsSaved: vi.fn(),
  },
}));

describe('saveFile', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  const mockTab: Tab = {
    id: 'tab-1',
    filePath: 'test.md',
    repositoryId: 'repo-1',
    title: 'test.md',
    content: '# Test Content',
    originalContent: '# Test Content',
    isDirty: false,
  };

  const mockTabState: TabState = {
    tabs: [mockTab],
    activeTabId: 'tab-1',
    visibleTabIds: ['tab-1'],
  };

  const mockRepositories: Repository[] = [mockRepository];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('ファイルを正常に保存できる', async () => {
      vi.mocked(gitClient.createFile).mockResolvedValue(undefined);

      const result = await saveFile(mockTabState, mockRepositories)();

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.createFile).toHaveBeenCalledWith(
        mockRepository,
        'test.md',
        '# Test Content'
      );
      expect(tabStore.markTabAsSaved).toHaveBeenCalledWith('tab-1');
    });

    it('contentがundefinedの場合、空文字列で保存する', async () => {
      const tabWithoutContent: Tab = {
        ...mockTab,
        content: undefined,
      };
      const tabStateWithoutContent: TabState = {
        ...mockTabState,
        tabs: [tabWithoutContent],
      };

      vi.mocked(gitClient.createFile).mockResolvedValue(undefined);

      const result = await saveFile(tabStateWithoutContent, mockRepositories)();

      expect(E.isRight(result)).toBe(true);
      expect(gitClient.createFile).toHaveBeenCalledWith(
        mockRepository,
        'test.md',
        ''
      );
    });
  });

  describe('エラーケース', () => {
    it('アクティブタブが存在しない場合、NO_ACTIVE_TABエラーを返す', async () => {
      const tabStateWithoutActive: TabState = {
        ...mockTabState,
        activeTabId: null,
      };

      const result = await saveFile(tabStateWithoutActive, mockRepositories)();

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('NO_ACTIVE_TAB');
      }
      expect(gitClient.createFile).not.toHaveBeenCalled();
      expect(tabStore.markTabAsSaved).not.toHaveBeenCalled();
    });

    it('リポジトリが存在しない場合、REPOSITORY_NOT_FOUNDエラーを返す', async () => {
      const emptyRepositories: Repository[] = [];

      const result = await saveFile(mockTabState, emptyRepositories)();

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      }
      expect(gitClient.createFile).not.toHaveBeenCalled();
      expect(tabStore.markTabAsSaved).not.toHaveBeenCalled();
    });

    it('ファイルパスが空の場合、FILE_NOT_FOUNDエラーを返す', async () => {
      const tabWithEmptyPath: Tab = {
        ...mockTab,
        filePath: '',
      };
      const tabStateWithEmptyPath: TabState = {
        ...mockTabState,
        tabs: [tabWithEmptyPath],
      };

      const result = await saveFile(tabStateWithEmptyPath, mockRepositories)();

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_NOT_FOUND');
      }
      expect(gitClient.createFile).not.toHaveBeenCalled();
      expect(tabStore.markTabAsSaved).not.toHaveBeenCalled();
    });

    it('createFileが失敗した場合、FILE_SYSTEM_ERRORを返す', async () => {
      const error = new Error('File system error');
      vi.mocked(gitClient.createFile).mockRejectedValue(error);

      const result = await saveFile(mockTabState, mockRepositories)();

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result) && result.left.type === 'FILE_SYSTEM_ERROR') {
        expect(result.left.filePath).toBe('test.md');
      }
      expect(tabStore.markTabAsSaved).not.toHaveBeenCalled();
    });

    it('createFileがENOENTエラーを返した場合、FILE_NOT_FOUNDエラーを返す', async () => {
      const error = new Error('ENOENT: no such file or directory');
      vi.mocked(gitClient.createFile).mockRejectedValue(error);

      const result = await saveFile(mockTabState, mockRepositories)();

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result) && result.left.type === 'FILE_NOT_FOUND') {
        expect(result.left.filePath).toBe('test.md');
      }
      expect(tabStore.markTabAsSaved).not.toHaveBeenCalled();
    });
  });
});

