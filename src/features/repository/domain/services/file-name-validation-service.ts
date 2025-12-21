import * as E from 'fp-ts/Either';

/**
 * バリデーションエラーの型
 */
export type ValidationError =
  | { type: 'INVALID_CHARACTER'; message: string; character: string }
  | { type: 'EMPTY_NAME'; message: string };

/**
 * 無効な文字のリスト
 */
const INVALID_CHARS = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

/**
 * ファイル名のバリデーション（純粋関数）
 * @param fileName - バリデーション対象のファイル名
 * @returns Either<ValidationError, string> - バリデーション結果
 */
export const validateFileName = (fileName: string): E.Either<ValidationError, string> => {
  // 空文字列チェック
  if (fileName.trim().length === 0) {
    return E.left({
      type: 'EMPTY_NAME',
      message: 'File name cannot be empty'
    });
  }

  // 先頭・末尾の空白チェック
  if (fileName !== fileName.trim()) {
    return E.left({
      type: 'INVALID_CHARACTER',
      message: 'File name cannot start or end with whitespace',
      character: 'whitespace'
    });
  }

  // 無効な文字チェック
  for (const char of INVALID_CHARS) {
    if (fileName.includes(char)) {
      return E.left({
        type: 'INVALID_CHARACTER',
        message: `File name contains invalid character: ${char}`,
        character: char
      });
    }
  }

  return E.right(fileName);
};

/**
 * ファイルの重複チェック（純粋関数）
 * @param filePath - チェック対象のファイルパス
 * @param existingFiles - 既存のファイルパスのリスト
 * @returns boolean - ファイルが存在する場合true
 */
export const checkFileExists = (filePath: string, existingFiles: string[]): boolean => {
  return existingFiles.includes(filePath);
};

