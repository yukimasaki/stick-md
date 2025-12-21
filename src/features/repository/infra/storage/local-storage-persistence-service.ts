import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import type {
  PersistenceService,
  PersistenceError,
  PersistedRepositoryState
} from '@/features/repository/domain/services/persistence-service';
import { validatePersistedState } from '@/features/repository/domain/services/persistence-service';

const STORAGE_KEY = 'repository-state';

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
): E.Either<PersistenceError, void> => {
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
): E.Either<PersistenceError, O.Option<string>> => {
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
const clearStorage = (key: string): E.Either<PersistenceError, void> => {
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
 * LocalStorage永続化サービスのファクトリ関数
 */
export const createLocalStoragePersistenceService = (): PersistenceService => {
  const save = (
    state: PersistedRepositoryState
  ): E.Either<PersistenceError, void> => {
    return pipe(
      JSON.stringify(state),
      (json) => saveToStorage(STORAGE_KEY, json)
    );
  };

  const load = (): E.Either<PersistenceError, O.Option<PersistedRepositoryState>> => {
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
                  validatePersistedState,
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

  const clear = (): E.Either<PersistenceError, void> => {
    return clearStorage(STORAGE_KEY);
  };

  return { save, load, clear };
};

