import { describe, it, expect, beforeEach } from 'vitest';
import { createTabStore } from './tab-store';
import type { TabPersistenceService } from '@/features/editor/domain/services/tab-persistence-service';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

describe('tab-store', () => {
  let mockPersistenceService: TabPersistenceService;
  let store: ReturnType<typeof createTabStore>;

  beforeEach(() => {
    mockPersistenceService = {
      save: () => E.right(undefined),
      load: () => E.right(O.none),
      clear: () => E.right(undefined),
    };
    store = createTabStore(mockPersistenceService);
  });

  describe('openTab', () => {
    it('新しいタブを開く', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      const state = store.getSnapshot();

      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0]).toMatchObject({
        filePath: 'file1.md',
        repositoryId: 'repo1',
        title: 'file1.md',
      });
      expect(state.activeTabId).toBe('repo1:file1.md');
      expect(state.visibleTabIds).toContain('repo1:file1.md');
    });

    it('複数のタブを開く', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.openTab('file3.md', 'repo1', 'file3.md');
      const state = store.getSnapshot();

      expect(state.tabs).toHaveLength(3);
      expect(state.activeTabId).toBe('repo1:file3.md');
    });

    it('既存のタブを開くとアクティブ化される', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.openTab('file1.md', 'repo1', 'file1.md'); // 既存のタブを再度開く

      const state = store.getSnapshot();
      expect(state.tabs).toHaveLength(2); // タブは増えない
      expect(state.activeTabId).toBe('repo1:file1.md');
    });

    it('ファイル内容を保存する', () => {
      store.openTab('file1.md', 'repo1', 'file1.md', 'content');
      const state = store.getSnapshot();

      expect(state.tabs[0].content).toBe('content');
    });

    it('表示タブの並び順: 新しいタブほど左に、古いタブほど右に配置される', () => {
      // タブを順番に開く
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.openTab('file3.md', 'repo1', 'file3.md');

      const state = store.getSnapshot();
      // visibleTabIdsの順序: [file3, file2, file1] (新しい順)
      expect(state.visibleTabIds).toEqual([
        'repo1:file3.md',
        'repo1:file2.md',
        'repo1:file1.md',
      ]);
    });

    it('表示タブが3つを超える場合、古いタブが非表示になる', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.openTab('file3.md', 'repo1', 'file3.md');
      store.openTab('file4.md', 'repo1', 'file4.md');

      const state = store.getSnapshot();
      expect(state.tabs).toHaveLength(4);
      expect(state.visibleTabIds).toHaveLength(3);
      expect(state.visibleTabIds).not.toContain('repo1:file1.md');
      expect(state.visibleTabIds).toContain('repo1:file4.md');
    });

    it('非表示タブの並び順: 新しいタブほど上に、古いタブほど下に配置される', () => {
      // 5つのタブを開く（表示は3つまで）
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.openTab('file3.md', 'repo1', 'file3.md');
      store.openTab('file4.md', 'repo1', 'file4.md');
      store.openTab('file5.md', 'repo1', 'file5.md');

      const state = store.getSnapshot();
      // tabs配列の順序: [file5, file4, file3, file2, file1] (新しい順)
      expect(state.tabs.map(t => t.filePath)).toEqual([
        'file5.md',
        'file4.md',
        'file3.md',
        'file2.md',
        'file1.md',
      ]);

      // 非表示タブ（visibleTabIdsに含まれないタブ）の順序
      const hiddenTabs = state.tabs.filter(
        tab => !state.visibleTabIds.includes(tab.id)
      );
      expect(hiddenTabs.map(t => t.filePath)).toEqual([
        'file2.md',
        'file1.md',
      ]);
    });
  });

  describe('closeTab', () => {
    it('タブを閉じる', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.closeTab('repo1:file1.md');

      const state = store.getSnapshot();
      expect(state.tabs).toHaveLength(0);
      expect(state.activeTabId).toBeNull();
    });

    it('アクティブタブを閉じると次のタブがアクティブ化される', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.closeTab('repo1:file2.md'); // アクティブタブを閉じる

      const state = store.getSnapshot();
      expect(state.activeTabId).toBe('repo1:file1.md');
    });

    it('表示タブを閉じると、非表示タブが表示エリアに移動する', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.openTab('file3.md', 'repo1', 'file3.md');
      store.openTab('file4.md', 'repo1', 'file4.md'); // 非表示になる

      let state = store.getSnapshot();
      expect(state.visibleTabIds).not.toContain('repo1:file1.md');

      store.closeTab('repo1:file3.md'); // 表示タブを閉じる
      state = store.getSnapshot();
      // file1が表示エリアに移動する
      expect(state.visibleTabIds).toContain('repo1:file1.md');
    });
  });

  describe('setActiveTab', () => {
    it('アクティブタブを設定する', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.setActiveTab('repo1:file1.md');

      const state = store.getSnapshot();
      expect(state.activeTabId).toBe('repo1:file1.md');
    });

    it('非表示タブをアクティブ化すると表示エリアに移動する', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.openTab('file3.md', 'repo1', 'file3.md');
      store.openTab('file4.md', 'repo1', 'file4.md'); // 非表示になる

      let state = store.getSnapshot();
      expect(state.visibleTabIds).not.toContain('repo1:file1.md');

      store.setActiveTab('repo1:file1.md');
      state = store.getSnapshot();
      expect(state.activeTabId).toBe('repo1:file1.md');
      expect(state.visibleTabIds).toContain('repo1:file1.md');
    });
  });

  describe('reorderTabs', () => {
    it('タブの順序を変更する', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo1', 'file2.md');
      store.openTab('file3.md', 'repo1', 'file3.md');

      store.reorderTabs([
        'repo1:file3.md',
        'repo1:file1.md',
        'repo1:file2.md',
      ]);

      const state = store.getSnapshot();
      expect(state.tabs.map(t => t.filePath)).toEqual([
        'file3.md',
        'file1.md',
        'file2.md',
      ]);
    });
  });

  describe('clearTabsByRepository', () => {
    it('指定したリポジトリのタブをクリアする', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo2', 'file2.md');
      store.openTab('file3.md', 'repo1', 'file3.md');

      store.clearTabsByRepository('repo1');

      const state = store.getSnapshot();
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].repositoryId).toBe('repo2');
    });

    it('クリアされたリポジトリのタブがアクティブだった場合、次のタブをアクティブ化する', () => {
      store.openTab('file1.md', 'repo1', 'file1.md');
      store.openTab('file2.md', 'repo2', 'file2.md');

      store.clearTabsByRepository('repo1');

      const state = store.getSnapshot();
      expect(state.activeTabId).toBe('repo2:file2.md');
    });
  });
});

