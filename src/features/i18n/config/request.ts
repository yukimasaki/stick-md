import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { detectLocale } from '@/features/i18n/application/services/locale-service';
import { isValidLocale, LOCALE_COOKIE_NAME } from '@/features/i18n/domain/types';

/**
 * next-intlのリクエスト設定
 * locale-based routingなしの場合の設定
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  let locale: string;

  // Cookieからロケールを取得
  if (cookieValue && isValidLocale(cookieValue)) {
    locale = cookieValue;
  } else {
    // Cookieにロケールがない場合は自動検出
    locale = await detectLocale();
  }

  // 翻訳メッセージを読み込み
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});

