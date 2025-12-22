/**
 * Gitログ取得エラーの型定義
 * Domain Layer: エラー型定義
 */
export type GitLogError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'GIT_LOG_ERROR'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

