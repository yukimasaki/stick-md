/**
 * Git変更破棄エラーの型定義
 * Domain Layer: エラー型定義
 */
export type GitCheckoutError =
  | { type: 'REPOSITORY_NOT_FOUND'; message: string }
  | { type: 'FILE_NOT_FOUND'; message: string; filePath: string }
  | { type: 'GIT_CHECKOUT_ERROR'; message: string; filePath: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

