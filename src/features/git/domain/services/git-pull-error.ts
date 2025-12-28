/**
 * Gitプルエラーの型定義
 * Domain Layer: エラー型定義
 */
export type GitPullError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'GIT_PULL_ERROR'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

