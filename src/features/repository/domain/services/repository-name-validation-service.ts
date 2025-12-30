import * as E from 'fp-ts/Either';

/**
 * バリデーションエラーの型
 */
export type RepositoryNameValidationError =
  | { type: 'EMPTY_NAME'; message: string }
  | { type: 'INVALID_LENGTH'; message: string; min: number; max: number }
  | { type: 'INVALID_CHARACTER'; message: string; character: string }
  | { type: 'INVALID_START_OR_END'; message: string }
  | { type: 'CONSECUTIVE_DOTS'; message: string }
  | { type: 'RESERVED_NAME'; message: string; name: string };

/**
 * リポジトリ名の最小長
 */
const MIN_LENGTH = 1;

/**
 * リポジトリ名の最大長
 */
const MAX_LENGTH = 100;

/**
 * 許可される文字の正規表現
 * 英数字、ハイフン、アンダースコア、ピリオドのみ
 */
const VALID_CHAR_PATTERN = /^[a-zA-Z0-9._-]+$/;

/**
 * 予約語のリスト
 */
const RESERVED_NAMES = ['.git', '.', '..'];

/**
 * リポジトリ名のバリデーション（純粋関数）
 * GitHubとgitが許容するリポジトリ名の規則に準拠
 * 
 * 規則:
 * - 1-100文字
 * - 英数字、ハイフン、アンダースコア、ピリオドのみ
 * - ピリオドで始まったり終わったりしない
 * - 連続するピリオドは不可
 * - 予約語（`.git`など）は不可
 * 
 * @param repositoryName - バリデーション対象のリポジトリ名
 * @returns Either<RepositoryNameValidationError, string> - バリデーション結果
 */
export const validateRepositoryName = (
  repositoryName: string
): E.Either<RepositoryNameValidationError, string> => {
  const trimmed = repositoryName.trim();

  // 空文字列チェック
  if (trimmed.length === 0) {
    return E.left({
      type: 'EMPTY_NAME',
      message: 'Repository name cannot be empty',
    });
  }

  // 長さチェック
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
    return E.left({
      type: 'INVALID_LENGTH',
      message: `Repository name must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`,
      min: MIN_LENGTH,
      max: MAX_LENGTH,
    });
  }

  // 予約語チェック（先頭・末尾のピリオドチェックより前に実行）
  if (RESERVED_NAMES.includes(trimmed.toLowerCase())) {
    return E.left({
      type: 'RESERVED_NAME',
      message: `Repository name "${trimmed}" is reserved`,
      name: trimmed,
    });
  }

  // 先頭・末尾のピリオドチェック
  if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return E.left({
      type: 'INVALID_START_OR_END',
      message: 'Repository name cannot start or end with a period',
    });
  }

  // 連続するピリオドチェック
  if (trimmed.includes('..')) {
    return E.left({
      type: 'CONSECUTIVE_DOTS',
      message: 'Repository name cannot contain consecutive periods',
    });
  }

  // 許可される文字のみかチェック
  if (!VALID_CHAR_PATTERN.test(trimmed)) {
    // 無効な文字を特定
    const invalidChar = trimmed.split('').find((char) => !VALID_CHAR_PATTERN.test(char));
    return E.left({
      type: 'INVALID_CHARACTER',
      message: `Repository name contains invalid character: ${invalidChar || 'unknown'}`,
      character: invalidChar || 'unknown',
    });
  }

  return E.right(trimmed);
};

