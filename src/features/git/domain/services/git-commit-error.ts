/**
 * Gitコミットエラーの型定義
 * Domain Layer: エラー型定義
 */
export type GitCommitError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'NO_STAGED_FILES'; message: string }
  | { type: 'EMPTY_COMMIT_MESSAGE'; message: string }
  | { type: 'GIT_COMMIT_ERROR'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

