/**
 * ファイル作成エラーの型
 * Domain Layer: ファイル作成時のエラーを表現
 */
export type FileCreationError =
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'FILE_ALREADY_EXISTS'; message: string; filePath: string }
  | { type: 'DIRECTORY_CREATION_FAILED'; message: string; directoryPath: string }
  | { type: 'FILE_CREATION_FAILED'; message: string; filePath: string }
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

