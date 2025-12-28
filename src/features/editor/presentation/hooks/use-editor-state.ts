import { useRef } from 'react';

/**
 * エディタの状態管理フック
 * Presentation Layer: エディタの状態を管理するカスタムフック
 */
export interface EditorState {
  /** 初期読み込み中かどうか */
  isInitializing: React.MutableRefObject<boolean>;
  /** 前回読み込んだタブID */
  lastLoadedTabId: React.MutableRefObject<string | null>;
  /** 前回読み込んだタブの内容 */
  lastLoadedContent: React.MutableRefObject<string | null>;
  /** IME入力中かどうか */
  isComposing: React.MutableRefObject<boolean>;
}

/**
 * エディタの状態を管理するカスタムフック
 */
export function useEditorState(): EditorState {
  const isInitializing = useRef(false);
  const lastLoadedTabId = useRef<string | null>(null);
  const lastLoadedContent = useRef<string | null>(null);
  const isComposing = useRef(false);

  return {
    isInitializing,
    lastLoadedTabId,
    lastLoadedContent,
    isComposing,
  };
}

