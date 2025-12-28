'use server';

import { revalidatePath } from 'next/cache';
import { setLocaleToCookie } from '@/features/i18n/infrastructure/cookie/locale-cookie';
import type { Locale } from '@/features/i18n/domain/types';
import { isValidLocale } from '@/features/i18n/domain/types';

/**
 * 言語を切り替えるServer Action
 * @param locale 切り替えるロケール
 */
export async function setLocaleAction(locale: Locale): Promise<void> {
  // ロケールの検証
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  // Cookieに保存
  await setLocaleToCookie(locale);

  // ページを再検証（言語切り替えを反映）
  revalidatePath('/', 'layout');
}

