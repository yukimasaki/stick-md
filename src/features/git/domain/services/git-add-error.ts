/**
 * Gitステージング追加エラーの型定義
 * Domain Layer: エラー型定義
 */
export type GitAddError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'FILE_NOT_FOUND'; message: string; filePath: string }
  | { type: 'GIT_ADD_ERROR'; message: string; filePath: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

