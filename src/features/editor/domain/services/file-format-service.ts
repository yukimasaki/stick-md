/**
 * 対応ファイル形式の拡張子リスト
 * Domain Layer: ファイル形式チェックの設定
 */
const SUPPORTED_EXTENSIONS = ['.md'] as const;

/**
 * ファイル形式が対応しているかチェック（純粋関数）
 * Domain Layer: ファイル形式チェック
 * 
 * @param filePath - チェック対象のファイルパス
 * @returns 対応している場合true
 */
export function isSupportedFileFormat(filePath: string): boolean {
  const lowerPath = filePath.toLowerCase();
  return SUPPORTED_EXTENSIONS.some(ext => lowerPath.endsWith(ext));
}

/**
 * 対応ファイル形式の拡張子リストを取得（将来的な拡張用）
 * Domain Layer: ファイル形式チェック
 * 
 * @returns 対応拡張子の配列
 */
export function getSupportedExtensions(): readonly string[] {
  return SUPPORTED_EXTENSIONS;
}

