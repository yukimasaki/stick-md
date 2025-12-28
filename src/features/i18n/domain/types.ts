/**
 * サポートするロケールの型定義
 */
export type Locale = 'ja' | 'en';

/**
 * 言語設定の選択肢（自動検出を含む）
 */
export type LocaleOption = Locale | 'auto';

/**
 * サポートするロケールのリスト
 */
export const LOCALES: readonly Locale[] = ['ja', 'en'] as const;

/**
 * デフォルトロケール
 */
export const DEFAULT_LOCALE: Locale = 'ja';

/**
 * next-intlのデフォルトCookie名
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * ロケールが有効かどうかを判定
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

