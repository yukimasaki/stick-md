/**
 * ファイル保存エラーの型
 * Domain Layer: ファイル保存時のエラーを表現
 */
export type FileSaveError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'FILE_NOT_FOUND'; message: string; filePath: string }
  | { type: 'NO_ACTIVE_TAB'; message: string }
  | { type: 'FILE_SYSTEM_ERROR'; message: string; filePath: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

