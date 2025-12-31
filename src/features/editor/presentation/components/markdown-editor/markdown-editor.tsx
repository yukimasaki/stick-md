'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { useTheme } from 'next-themes';
import { BlockNoteSchema, createCodeBlockSpec } from '@blocknote/core';
import { createHighlighter } from './shiki.bundle';
import { useEditor } from '@/features/editor/presentation/hooks/use-editor';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import { useEditorState } from '@/features/editor/presentation/hooks/use-editor-state';
import { useTabContentLoader, useExternalContentLoader } from '@/features/editor/presentation/hooks/use-content-loader';
import { useImeHandler } from '@/features/editor/presentation/hooks/use-ime-handler';
import { useEditorChangeHandler } from '@/features/editor/presentation/hooks/use-editor-change-handler';
import { useCursorMovement } from '@/features/editor/presentation/hooks/use-cursor-movement';

// Dynamic import of the wrapper component
const Editor = dynamic(() => import('./editor-wrapper'), { ssr: false });

// サポートするコードブロックの言語設定
const SUPPORTED_LANGUAGES = {
  typescript: { name: 'TypeScript', aliases: ['ts', 'cts', 'mts'] },
  javascript: { name: 'JavaScript', aliases: ['js', 'cjs', 'mjs'] },
  python: { name: 'Python', aliases: ['py'] },
  markdown: { name: 'Markdown', aliases: ['md'] },
  json: { name: 'JSON' },
  css: { name: 'CSS' },
  html: { name: 'HTML' },
  shellscript: { name: 'Shell', aliases: ['bash', 'sh', 'shell', 'zsh'] },
};

interface MarkdownEditorProps {
  tabId?: string;
}

export function MarkdownEditor({ tabId }: MarkdownEditorProps) {
  const { theme, systemTheme } = useTheme();
  const { lastCursorMove } = useEditor();
  
  // テーマの決定（システム設定の場合はsystemThemeを使用）
  const editorTheme = theme === 'system' ? (systemTheme || 'light') : theme;
  const blockNoteTheme = (editorTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  
  // BlockNoteエディタの作成（シンタックスハイライト付きcodeblock設定）
  const editor = useCreateBlockNote({
    schema: BlockNoteSchema.create().extend({
      blockSpecs: {
        codeBlock: createCodeBlockSpec({
          indentLineWithTab: true,
          defaultLanguage: 'typescript',
          supportedLanguages: SUPPORTED_LANGUAGES,
          createHighlighter: () =>
            createHighlighter({
              themes: ['dark-plus', 'light-plus'],
              langs: [], // 言語はバンドルに含まれている
            }),
        }),
      },
    }),
  });
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
    <div className="h-full w-full flex flex-col px-0 py-4 bg-background">
      <div className="flex-1 min-h-0 overflow-y-auto bg-background">
        <Editor editor={editor} theme={blockNoteTheme} />
      </div>
    </div>
  );
}
