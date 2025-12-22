/**
 * Gitステータス取得エラーの型定義
 * Domain Layer: エラー型定義
 */
export type GitStatusError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'GIT_STATUS_ERROR'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

