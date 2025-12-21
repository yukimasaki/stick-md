/**
 * ファイル読み込みエラーの型
 * Domain Layer: ファイル読み込み時のエラーを表現
 */
export type FileReadError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'FILE_NOT_FOUND'; message: string; filePath: string }
  | { type: 'FILE_SYSTEM_ERROR'; message: string; filePath: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

