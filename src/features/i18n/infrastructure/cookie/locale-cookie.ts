import { cookies } from 'next/headers';
import type { Locale } from '@/features/i18n/domain/types';
import { DEFAULT_LOCALE, isValidLocale, LOCALE_COOKIE_NAME } from '@/features/i18n/domain/types';

/**
 * Cookieからロケールを取得（Server Component用）
 * @returns ロケール、見つからない場合はデフォルトロケール
 */
export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }

  return DEFAULT_LOCALE;
}

/**
 * Cookieにロケールを保存（Server Action用）
 * @param locale 保存するロケール
 */
export async function setLocaleToCookie(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1年
    sameSite: 'lax',
  });
}

