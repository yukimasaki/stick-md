'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';
import { useTransition } from 'react';
import { setLocaleAction } from '@/features/i18n/application/actions/set-locale-action';
import type { Locale } from '@/features/i18n/domain/types';
import { LOCALE_COOKIE_NAME } from '@/features/i18n/domain/types';

/**
 * 言語設定を管理するカスタムフック
 * @returns 現在のロケールと切り替え関数
 */
export function useLocale() {
  const locale = useNextIntlLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  /**
   * ロケールを切り替える
   * @param newLocale 新しいロケール
   */
  const switchLocale = (newLocale: Locale) => {
    startTransition(async () => {
      await setLocaleAction(newLocale);
      // ページをリロードして言語変更を反映
      window.location.reload();
    });
  };

  /**
   * 自動検出に切り替える（Cookieを削除してリロード）
   */
  const switchToAuto = () => {
    // Cookieを削除
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
    // ページをリロードして自動検出を実行
    window.location.reload();
  };

  return {
    locale,
    switchLocale,
    switchToAuto,
    isPending,
  };
}

