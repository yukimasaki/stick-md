/**
 * ファイル削除エラーの型
 * Domain Layer: ファイル削除時のエラーを表現
 */
export type FileDeletionError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'FILE_NOT_FOUND'; message: string; filePath: string }
  | { type: 'FILE_SYSTEM_ERROR'; message: string; filePath: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

