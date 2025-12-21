/**
 * コンテンツ比較サービス
 * Domain Layer: 純粋関数によるコンテンツ比較
 */

/**
 * 元のコンテンツと現在のコンテンツを比較して、変更があるかどうかを判定
 * @param original - 元のコンテンツ（保存済みの状態）
 * @param current - 現在のコンテンツ
 * @returns 変更がある場合はtrue、変更がない場合はfalse
 */
export function compareContent(
  original: string | undefined,
  current: string | undefined
): boolean {
  // 両方がundefinedの場合は変更なし
  if (original === undefined && current === undefined) {
    return false;
  }

  // 片方がundefinedの場合は変更あり
  if (original === undefined || current === undefined) {
    return true;
  }

  // 両方が存在する場合は文字列比較（trim後の比較）
  return original.trim() !== current.trim();
}

