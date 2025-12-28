/**
 * Gitプッシュエラーの型定義
 * Domain Layer: エラー型定義
 */
export type GitPushError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'GIT_PUSH_ERROR'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

