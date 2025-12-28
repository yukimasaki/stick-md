'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEditor } from '@/features/editor/presentation/hooks/use-editor';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToolbarSettings } from '@/features/editor/presentation/hooks/use-toolbar-settings';
import { useTranslations } from 'next-intl';

const BASE_OFFSET = 24; // デフォルトのベース位置（24px）

export function Toolbar() {
  const t = useTranslations();
  const { actions } = useEditor();
  const isMobile = useIsMobile();
  const { offset: settingsOffset } = useToolbarSettings();
  const [bottom, setBottom] = useState(BASE_OFFSET + settingsOffset);

  // 設定値が変更されたときに位置を更新
  useEffect(() => {
    if (!isMobile || typeof window === 'undefined' || !window.visualViewport) {
      // Hydrationエラーを防ぐため、クライアントサイドでのみ状態を更新
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBottom(BASE_OFFSET + settingsOffset);
      return;
    }

    const viewport = window.visualViewport;
    const isKeyboardVisible = viewport.height < window.innerHeight;

    if (isKeyboardVisible) {
      const toolbarHeight = 64;
      const calculatedBottom = window.innerHeight - viewport.height - toolbarHeight;
      setBottom(Math.max(BASE_OFFSET + settingsOffset, calculatedBottom + BASE_OFFSET + settingsOffset));
    } else {
      setBottom(BASE_OFFSET + settingsOffset);
    }
  }, [isMobile, settingsOffset]);

  // Visual Viewport APIを使って仮想キーボードの真上に表示
  useEffect(() => {
    if (!isMobile || typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const updatePosition = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      // キーボードが表示されているかどうかを判定
      // visualViewport.heightがwindow.innerHeightより小さい場合、キーボードが表示されている
      const isKeyboardVisible = viewport.height < window.innerHeight;

      if (isKeyboardVisible) {
        // キーボードが表示されている場合、visualViewport.heightからツールバーの高さとオフセットを引く
        // ツールバーの高さは約64px (h-12 + padding)
        const toolbarHeight = 64;
        const calculatedBottom = window.innerHeight - viewport.height - toolbarHeight;
        // ベースオフセット（24px）+ 設定されたオフセット値を加算し、負の値にならないようにする
        setBottom(Math.max(BASE_OFFSET + settingsOffset, calculatedBottom + BASE_OFFSET + settingsOffset));
      } else {
        // キーボードが非表示の場合はベースオフセット（24px）+ 設定されたオフセット値の位置
        setBottom(BASE_OFFSET + settingsOffset);
      }
    };

    // 初回実行
    updatePosition();

    // Visual Viewport APIのイベントリスナーを登録
    window.visualViewport?.addEventListener('resize', updatePosition);
    window.visualViewport?.addEventListener('scroll', updatePosition);

    return () => {
      window.visualViewport?.removeEventListener('resize', updatePosition);
      window.visualViewport?.removeEventListener('scroll', updatePosition);
    };
  }, [isMobile, settingsOffset]);

  // PCでは非表示
  if (!isMobile) {
    return null;
  }

  return (
    <div
      className="fixed left-1/2 flex -translate-x-1/2 items-center justify-center gap-4 rounded-full bg-accent/80 p-2 shadow-lg backdrop-blur-sm transition-[bottom] duration-200"
      style={{ bottom: `${bottom}px` }}
    >
      <button
        onClick={() => actions.moveCursor('left')}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm transition-colors hover:bg-accent active:scale-95"
        aria-label={t('ariaLabel.moveCursorLeft')}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div className="h-8 w-px bg-border/50" />

      <button
        onClick={() => actions.moveCursor('right')}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm transition-colors hover:bg-accent active:scale-95"
        aria-label={t('ariaLabel.moveCursorRight')}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
