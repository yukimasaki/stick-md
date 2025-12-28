'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'toolbar-bottom-offset';
const DEFAULT_OFFSET = 0;

/**
 * ツールバーの位置設定を管理するカスタムフック
 * LocalStorageに設定値を保存し、読み込みを行う
 */
export function useToolbarSettings() {
  const [offset, setOffset] = useState<number>(DEFAULT_OFFSET);

  // LocalStorageから初期値を読み込み
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          // バリデーション: -200-200pxの範囲
          if (!isNaN(parsed) && parsed >= -200 && parsed <= 200) {
            setOffset(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load toolbar settings from localStorage:', error);
      }
  }, []);

  // オフセット値を更新（LocalStorageにも保存）
  const updateOffset = (newOffset: number) => {
    // バリデーション: -200-200pxの範囲
    const validatedOffset = Math.max(-200, Math.min(200, Math.round(newOffset)));

    try {
      localStorage.setItem(STORAGE_KEY, validatedOffset.toString());
      setOffset(validatedOffset);
    } catch (error) {
      console.error('Failed to save toolbar settings to localStorage:', error);
    }
  };

  return { offset, updateOffset };
}

