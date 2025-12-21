import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import type { TabState, Tab } from '@/features/editor/domain/models/tab-state';
import { createEmptyTabState } from '@/features/editor/domain/models/tab-state';
import type { TabPersistenceService } from '@/features/editor/domain/services/tab-persistence-service';

type Listener = () => void;

const MAX_VISIBLE_TABS = 3;

export const createTabStore = (persistenceService?: TabPersistenceService) => {
  let state: TabState = createEmptyTabState();

  const listeners: Set<Listener> = new Set();

  const getSnapshot = () => state;

  const subscribe = (listener: Listener): () => void => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const notify = () => {
    listeners.forEach(listener => listener());
  };

  /**
   * タブIDを生成
   */
  const generateTabId = (filePath: string, repositoryId: string): string => {
    return `${repositoryId}:${filePath}`;
  };

  /**
   * タブを開く（既存の場合はアクティブ化）
   */
  const openTab = (filePath: string, repositoryId: string, title: string, content?: string) => {
    const tabId = generateTabId(filePath, repositoryId);
    
    // 既存のタブを探す
    const existingTabIndex = state.tabs.findIndex(tab => tab.id === tabId);
    
    if (existingTabIndex >= 0) {
      // 既存のタブがある場合はアクティブ化
      // 内容が提供されている場合は更新
      const updatedTabs = [...state.tabs];
      if (content !== undefined) {
        updatedTabs[existingTabIndex] = {
          ...updatedTabs[existingTabIndex],
          content
        };
      }
      
      state = {
        ...state,
        tabs: updatedTabs,
        activeTabId: tabId,
        // 表示タブに含まれていない場合は追加（LRU方式）
        visibleTabIds: state.visibleTabIds.includes(tabId)
          ? state.visibleTabIds
          : [
              tabId,
              ...state.visibleTabIds.filter(id => id !== tabId)
            ].slice(0, MAX_VISIBLE_TABS)
      };
    } else {
      // 新しいタブを作成
      const newTab: Tab = {
        id: tabId,
        filePath,
        repositoryId,
        title,
        content
      };

      // 新しいタブを先頭に追加
      const newTabs = [newTab, ...state.tabs];
      
      // 表示タブを更新（LRU方式）
      const newVisibleTabIds = [
        tabId,
        ...state.visibleTabIds
      ].slice(0, MAX_VISIBLE_TABS);

      state = {
        tabs: newTabs,
        activeTabId: tabId,
        visibleTabIds: newVisibleTabIds
      };
    }

    notify();
    saveState();
  };

  /**
   * タブを閉じる
   */
  const closeTab = (tabId: string) => {
    const tabIndex = state.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex < 0) return;

    const newTabs = state.tabs.filter(tab => tab.id !== tabId);
    const newVisibleTabIds = state.visibleTabIds.filter(id => id !== tabId);
    
    // 閉じたタブが表示タブに含まれていた場合、次のタブを表示エリアに追加
    const wasVisible = state.visibleTabIds.includes(tabId);
    let finalVisibleTabIds = newVisibleTabIds;
    
    if (wasVisible && newTabs.length > 0 && newVisibleTabIds.length < MAX_VISIBLE_TABS) {
      // 表示されていないタブから最初のものを追加
      const hiddenTab = newTabs.find(tab => !newVisibleTabIds.includes(tab.id));
      if (hiddenTab) {
        finalVisibleTabIds = [...newVisibleTabIds, hiddenTab.id].slice(0, MAX_VISIBLE_TABS);
      }
    }

    // アクティブタブが閉じられた場合、次のタブをアクティブ化
    let newActiveTabId = state.activeTabId;
    if (state.activeTabId === tabId) {
      if (newTabs.length > 0) {
        // 同じインデックスのタブ、または最後のタブをアクティブ化
        const nextTab = newTabs[tabIndex] || newTabs[newTabs.length - 1];
        newActiveTabId = nextTab.id;
      } else {
        newActiveTabId = null;
      }
    }

    state = {
      tabs: newTabs,
      activeTabId: newActiveTabId,
      visibleTabIds: finalVisibleTabIds
    };

    notify();
    saveState();
  };

  /**
   * アクティブタブを設定
   */
  const setActiveTab = (tabId: string) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab) return;

    // 表示タブに含まれていない場合は追加（LRU方式）
    const newVisibleTabIds = state.visibleTabIds.includes(tabId)
      ? state.visibleTabIds
      : [
          tabId,
          ...state.visibleTabIds.filter(id => id !== tabId)
        ].slice(0, MAX_VISIBLE_TABS);

    state = {
      ...state,
      activeTabId: tabId,
      visibleTabIds: newVisibleTabIds
    };

    notify();
    saveState();
  };

  /**
   * タブの順序を変更
   */
  const reorderTabs = (tabIds: string[]) => {
    // タブIDの順序に従ってタブを並び替え
    const orderedTabs = tabIds
      .map(id => state.tabs.find(tab => tab.id === id))
      .filter((tab): tab is Tab => tab !== undefined);
    
    // 順序に含まれていないタブを末尾に追加
    const remainingTabs = state.tabs.filter(tab => !tabIds.includes(tab.id));
    const newTabs = [...orderedTabs, ...remainingTabs];

    // visibleTabIdsの順序も更新（表示中のタブの順序を維持）
    const newVisibleTabIds = state.visibleTabIds
      .filter(id => tabIds.includes(id))
      .sort((a, b) => {
        const indexA = tabIds.indexOf(a);
        const indexB = tabIds.indexOf(b);
        return indexA - indexB;
      });

    state = {
      ...state,
      tabs: newTabs,
      visibleTabIds: newVisibleTabIds
    };

    notify();
    saveState();
  };

  /**
   * リポジトリが変わった場合、該当リポジトリのタブをクリア
   */
  const clearTabsByRepository = (repositoryId: string) => {
    const newTabs = state.tabs.filter(tab => tab.repositoryId !== repositoryId);
    const newVisibleTabIds = state.visibleTabIds.filter(id => {
      const tab = newTabs.find(t => t.id === id);
      return tab !== undefined;
    });

    // アクティブタブがクリアされた場合、次のタブをアクティブ化
    let newActiveTabId = state.activeTabId;
    if (state.activeTabId) {
      const activeTab = newTabs.find(t => t.id === state.activeTabId);
      if (!activeTab) {
        newActiveTabId = newTabs.length > 0 ? newTabs[0].id : null;
      }
    }

    state = {
      tabs: newTabs,
      activeTabId: newActiveTabId,
      visibleTabIds: newVisibleTabIds
    };

    notify();
    saveState();
  };

  /**
   * 状態を保存
   */
  const saveState = () => {
    if (persistenceService) {
      pipe(
        state,
        persistenceService.save,
        E.fold(
          (error) => console.error('Failed to save tab state:', error),
          () => {} // 成功時は何もしない
        )
      );
    }
  };

  /**
   * 初期化（LocalStorageから読み込み）
   */
  const initialize = () => {
    if (persistenceService) {
      pipe(
        persistenceService.load(),
        E.fold(
          (error) => console.error('Failed to load tab state:', error),
          (maybeState) =>
            pipe(
              maybeState,
              O.fold(
                () => {}, // 保存された状態がない場合
                (persistedState) => {
                  state = persistedState;
                  notify();
                }
              )
            )
        )
      );
    }
  };

  return {
    getSnapshot,
    subscribe,
    openTab,
    closeTab,
    setActiveTab,
    reorderTabs,
    clearTabsByRepository,
    initialize
  };
};

import { createLocalStorageTabPersistenceService } from '@/features/editor/infra/storage/local-storage-tab-persistence-service';

// 永続化サービスを注入してストアを作成
const persistenceService = createLocalStorageTabPersistenceService();
export const tabStore = createTabStore(persistenceService);

