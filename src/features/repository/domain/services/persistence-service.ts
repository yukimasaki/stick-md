import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

/**
 * 永続化するリポジトリ状態の型
 */
export interface PersistedRepositoryState {
  selectedRepositoryId: string | null;
}

/**
 * 永続化エラーの型
 */
export type PersistenceError =
  | { type: 'STORAGE_UNAVAILABLE'; message: string }
  | { type: 'INVALID_DATA'; message: string }
  | { type: 'PARSE_ERROR'; message: string };

/**
 * 永続化サービスのインターフェース（関数型）
 */
export interface PersistenceService {
  save: (state: PersistedRepositoryState) => E.Either<PersistenceError, void>;
  load: () => E.Either<PersistenceError, O.Option<PersistedRepositoryState>>;
  clear: () => E.Either<PersistenceError, void>;
}

/**
 * バリデーション関数（純粋関数）
 * 入力データがPersistedRepositoryStateとして有効かチェック
 */
export const validatePersistedState = (
  data: unknown
): E.Either<PersistenceError, PersistedRepositoryState> => {
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

  // selectedRepositoryId の存在チェック
  if (!('selectedRepositoryId' in obj)) {
    return E.left({
      type: 'INVALID_DATA',
      message: 'selectedRepositoryId is required'
    });
  }

  // selectedRepositoryId の型チェック
  const selectedRepositoryId = obj.selectedRepositoryId;
  if (selectedRepositoryId !== null && typeof selectedRepositoryId !== 'string') {
    return E.left({
      type: 'INVALID_DATA',
      message: 'selectedRepositoryId must be string or null'
    });
  }

  // バリデーション成功
  return E.right({
    selectedRepositoryId
  });
};

