'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { useEditor } from '@/features/editor/presentation/hooks/use-editor';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import { useEditorState } from '@/features/editor/presentation/hooks/use-editor-state';
import { useTabContentLoader, useExternalContentLoader } from '@/features/editor/presentation/hooks/use-content-loader';
import { useImeHandler } from '@/features/editor/presentation/hooks/use-ime-handler';
import { useEditorChangeHandler } from '@/features/editor/presentation/hooks/use-editor-change-handler';
import { useCursorMovement } from '@/features/editor/presentation/hooks/use-cursor-movement';

// Dynamic import of the wrapper component
const Editor = dynamic(() => import('./editor-wrapper'), { ssr: false });

interface MarkdownEditorProps {
  tabId?: string;
}

export function MarkdownEditor({ tabId }: MarkdownEditorProps) {
  const editor = useCreateBlockNote();
  const { lastCursorMove } = useEditor();
  const tabState = useSyncExternalStore(
    tabStore.subscribe,
    tabStore.getSnapshot,
    tabStore.getSnapshot
  );
  
  const activeTab = tabState.tabs.find(tab => tab.id === tabId || tab.id === tabState.activeTabId);
  
  // エディタの状態管理
  const editorState = useEditorState();
  
  // コンテンツ読み込み処理
  useTabContentLoader(editor, activeTab, editorState);
  useExternalContentLoader(editor, activeTab, editorState);
  
  // IME入力処理
  useImeHandler(editor, activeTab, editorState);
  
  // エディタの変更検知
  useEditorChangeHandler(editor, activeTab, editorState);

  // カーソル移動処理
  useCursorMovement(editor, lastCursorMove);

  if (!editor) {
    return <div>Loading Editor...</div>;
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-background pl-0 pr-4 py-4">
      <Editor editor={editor} theme="light" />
    </div>
  );
}
