import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import type {
  TabPersistenceService,
  TabPersistenceError
} from '@/features/editor/domain/services/tab-persistence-service';
import { validateTabState } from '@/features/editor/domain/services/tab-persistence-service';
import type { TabState } from '@/features/editor/domain/models/tab-state';

const STORAGE_KEY = 'editor-tab-state';

/**
 * LocalStorageが利用可能かチェック（純粋関数）
 */
const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * LocalStorageへの保存（副作用を含む関数）
 */
const saveToStorage = (
  key: string,
  value: string
): E.Either<TabPersistenceError, void> => {
  try {
    if (!isStorageAvailable()) {
      return E.left({
        type: 'STORAGE_UNAVAILABLE',
        message: 'LocalStorage is not available'
      });
    }
    localStorage.setItem(key, value);
    return E.right(undefined);
  } catch (error) {
    return E.left({
      type: 'STORAGE_UNAVAILABLE',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * LocalStorageからの読み込み（副作用を含む関数）
 */
const loadFromStorage = (
  key: string
): E.Either<TabPersistenceError, O.Option<string>> => {
  try {
    if (!isStorageAvailable()) {
      return E.left({
        type: 'STORAGE_UNAVAILABLE',
        message: 'LocalStorage is not available'
      });
    }
    const value = localStorage.getItem(key);
    if (value === null || value === '') {
      return E.right(O.none);
    }
    return E.right(O.some(value));
  } catch (error) {
    return E.left({
      type: 'STORAGE_UNAVAILABLE',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * LocalStorageのクリア（副作用を含む関数）
 */
const clearStorage = (key: string): E.Either<TabPersistenceError, void> => {
  try {
    if (!isStorageAvailable()) {
      return E.left({
        type: 'STORAGE_UNAVAILABLE',
        message: 'LocalStorage is not available'
      });
    }
    localStorage.removeItem(key);
    return E.right(undefined);
  } catch (error) {
    return E.left({
      type: 'STORAGE_UNAVAILABLE',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * LocalStorageタブ状態永続化サービスのファクトリ関数
 */
export const createLocalStorageTabPersistenceService = (): TabPersistenceService => {
  const save = (
    state: TabState
  ): E.Either<TabPersistenceError, void> => {
    return pipe(
      JSON.stringify(state),
      (json) => saveToStorage(STORAGE_KEY, json)
    );
  };

  const load = (): E.Either<TabPersistenceError, O.Option<TabState>> => {
    return pipe(
      loadFromStorage(STORAGE_KEY),
      E.chain((maybeJson) =>
        pipe(
          maybeJson,
          O.fold(
            () => E.right(O.none),
            (json) => {
              try {
                const parsed = JSON.parse(json);
                return pipe(
                  parsed,
                  validateTabState,
                  E.map(O.some)
                );
              } catch (error) {
                return E.left({
                  type: 'PARSE_ERROR',
                  message: error instanceof Error ? error.message : 'Failed to parse JSON'
                });
              }
            }
          )
        )
      )
    );
  };

  const clear = (): E.Either<TabPersistenceError, void> => {
    return clearStorage(STORAGE_KEY);
  };

  return { save, load, clear };
};

