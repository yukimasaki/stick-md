import { headers } from 'next/headers';
import type { Locale } from '@/features/i18n/domain/types';
import { DEFAULT_LOCALE, LOCALES } from '@/features/i18n/domain/types';

/**
 * accept-languageヘッダーからロケールを自動検出
 * @returns 検出されたロケール、見つからない場合はデフォルトロケール
 */
export async function detectLocale(): Promise<Locale> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // accept-languageヘッダーを解析
  // 例: "ja,en-US;q=0.9,en;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, q = '1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', ''));
      return { locale: locale.toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // サポートするロケールと一致するものを探す
  for (const { locale } of languages) {
    // 完全一致（例: "ja"）
    if (LOCALES.includes(locale as Locale)) {
      return locale as Locale;
    }

    // 言語コードのみ一致（例: "ja-JP" -> "ja"）
    const langCode = locale.split('-')[0];
    if (LOCALES.includes(langCode as Locale)) {
      return langCode as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

