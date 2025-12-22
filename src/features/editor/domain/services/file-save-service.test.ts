import { describe, it, expect } from 'vitest';
import * as E from 'fp-ts/Either';
import { validateSaveRequest } from './file-save-service';
import type { TabState, Tab } from '@/features/editor/domain/models/tab-state';
import type { Repository } from '@/features/repository/domain/models/repository';

describe('validateSaveRequest', () => {
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
    content: '# Test',
    originalContent: '# Test',
    isDirty: false,
  };

  const mockTabState: TabState = {
    tabs: [mockTab],
    activeTabId: 'tab-1',
    visibleTabIds: ['tab-1'],
  };

  const mockRepositories: Repository[] = [mockRepository];

  describe('正常系', () => {
    it('アクティブタブとリポジトリが存在する場合、成功を返す', () => {
      const result = validateSaveRequest(mockTabState, mockRepositories);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.tab).toEqual(mockTab);
        expect(result.right.repository).toEqual(mockRepository);
      }
    });
  });

  describe('エラーケース', () => {
    it('アクティブタブが存在しない場合、NO_ACTIVE_TABエラーを返す', () => {
      const tabStateWithoutActive: TabState = {
        ...mockTabState,
        activeTabId: null,
      };

      const result = validateSaveRequest(tabStateWithoutActive, mockRepositories);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('NO_ACTIVE_TAB');
        expect(result.left.message).toContain('No active tab');
      }
    });

    it('アクティブタブIDに対応するタブが存在しない場合、NO_ACTIVE_TABエラーを返す', () => {
      const tabStateWithInvalidId: TabState = {
        ...mockTabState,
        activeTabId: 'non-existent-tab',
      };

      const result = validateSaveRequest(tabStateWithInvalidId, mockRepositories);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('NO_ACTIVE_TAB');
      }
    });

    it('リポジトリが存在しない場合、REPOSITORY_NOT_FOUNDエラーを返す', () => {
      const emptyRepositories: Repository[] = [];

      const result = validateSaveRequest(mockTabState, emptyRepositories);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
        expect(result.left.message).toContain('Repository not found');
      }
    });

    it('タブのrepositoryIdに対応するリポジトリが存在しない場合、REPOSITORY_NOT_FOUNDエラーを返す', () => {
      const differentRepository: Repository = {
        id: 'repo-2',
        name: 'other-repo',
        full_name: 'user/other-repo',
        private: false,
      };

      const result = validateSaveRequest(mockTabState, [differentRepository]);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      }
    });

    it('ファイルパスが空文字列の場合、FILE_NOT_FOUNDエラーを返す', () => {
      const tabWithEmptyPath: Tab = {
        ...mockTab,
        filePath: '',
      };

      const tabStateWithEmptyPath: TabState = {
        ...mockTabState,
        tabs: [tabWithEmptyPath],
      };

      const result = validateSaveRequest(tabStateWithEmptyPath, mockRepositories);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_NOT_FOUND');
        expect(result.left.filePath).toBe('');
      }
    });

    it('ファイルパスが空白のみの場合、FILE_NOT_FOUNDエラーを返す', () => {
      const tabWithWhitespacePath: Tab = {
        ...mockTab,
        filePath: '   ',
      };

      const tabStateWithWhitespacePath: TabState = {
        ...mockTabState,
        tabs: [tabWithWhitespacePath],
      };

      const result = validateSaveRequest(tabStateWithWhitespacePath, mockRepositories);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('FILE_NOT_FOUND');
      }
    });
  });
});

