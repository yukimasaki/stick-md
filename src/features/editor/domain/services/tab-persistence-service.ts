import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import type { TabState } from '@/features/editor/domain/models/tab-state';

/**
 * 永続化エラーの型
 */
export type TabPersistenceError =
  | { type: 'STORAGE_UNAVAILABLE'; message: string }
  | { type: 'INVALID_DATA'; message: string }
  | { type: 'PARSE_ERROR'; message: string };

/**
 * タブ状態永続化サービスのインターフェース（関数型）
 */
export interface TabPersistenceService {
  save: (state: TabState) => E.Either<TabPersistenceError, void>;
  load: () => E.Either<TabPersistenceError, O.Option<TabState>>;
  clear: () => E.Either<TabPersistenceError, void>;
}

/**
 * バリデーション関数（純粋関数）
 * 入力データがTabStateとして有効かチェック
 */
export const validateTabState = (
  data: unknown
): E.Either<TabPersistenceError, TabState> => {
  // null または undefined のチェック
  if (data === null || data === undefined) {
    return E.left({
      type: 'INVALID_DATA',
      message: 'Data is null or undefined'
    });
  }

  // オブジェクトのチェック
  if (typeof data !== 'object' || Array.isArray(data)) {
    return E.left({
      type: 'INVALID_DATA',
      message: 'Data must be an object'
    });
  }

  const obj = data as Record<string, unknown>;

  // tabs の存在チェック
  if (!('tabs' in obj) || !Array.isArray(obj.tabs)) {
    return E.left({
      type: 'INVALID_DATA',
      message: 'tabs must be an array'
    });
  }

  // activeTabId の存在チェック
  if (!('activeTabId' in obj)) {
    return E.left({
      type: 'INVALID_DATA',
      message: 'activeTabId is required'
    });
  }

  // activeTabId の型チェック
  const activeTabId = obj.activeTabId;
  if (activeTabId !== null && typeof activeTabId !== 'string') {
    return E.left({
      type: 'INVALID_DATA',
      message: 'activeTabId must be string or null'
    });
  }

  // visibleTabIds の存在チェック
  if (!('visibleTabIds' in obj) || !Array.isArray(obj.visibleTabIds)) {
    return E.left({
      type: 'INVALID_DATA',
      message: 'visibleTabIds must be an array'
    });
  }

  // tabs の各要素のバリデーション
  const tabs = obj.tabs as unknown[];
  for (const tab of tabs) {
    if (typeof tab !== 'object' || tab === null || Array.isArray(tab)) {
      return E.left({
        type: 'INVALID_DATA',
        message: 'Each tab must be an object'
      });
    }

    const tabObj = tab as Record<string, unknown>;
    if (
      typeof tabObj.id !== 'string' ||
      typeof tabObj.filePath !== 'string' ||
      typeof tabObj.repositoryId !== 'string' ||
      typeof tabObj.title !== 'string'
    ) {
      return E.left({
        type: 'INVALID_DATA',
        message: 'Tab must have id, filePath, repositoryId, and title as strings'
      });
    }
  }

  // visibleTabIds の各要素のバリデーション
  const visibleTabIds = obj.visibleTabIds as unknown[];
  for (const id of visibleTabIds) {
    if (typeof id !== 'string') {
      return E.left({
        type: 'INVALID_DATA',
        message: 'Each visibleTabId must be a string'
      });
    }
  }

  // バリデーション成功
  return E.right({
    tabs: tabs as TabState['tabs'],
    activeTabId: activeTabId as string | null,
    visibleTabIds: visibleTabIds as string[],
  });
};

