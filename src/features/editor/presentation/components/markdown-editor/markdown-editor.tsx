'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { useEditor } from '@/features/editor/presentation/hooks/use-editor';
import { tabStore } from '@/features/editor/application/stores/tab-store';

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
  
  // 初期読み込み中かどうかを管理するフラグ
  const isInitializingRef = useRef(false);
  // 前回読み込んだタブIDを保持（タブ切り替え検知用）
  const lastLoadedTabIdRef = useRef<string | null>(null);

  // アクティブタブの内容をエディタに読み込む（タブ切り替え時のみ）
  useEffect(() => {
    if (!editor || !activeTab?.content) return;

    async function loadContent() {
      try {
        if (!activeTab?.content) return;
        
        // タブが切り替わった場合は必ず読み込む
        const isTabSwitched = lastLoadedTabIdRef.current !== activeTab.id;
        
        if (!isTabSwitched) {
          // タブが切り替わっていない場合、現在のエディタの内容を取得して比較（無限ループ防止）
          const currentMarkdown = await editor.blocksToMarkdownLossy(editor.document);
          // 現在の内容とタブの内容が同じ場合は更新しない（IME入力中の再レンダリングを防ぐ）
          if (currentMarkdown.trim() === activeTab.content.trim()) {
            return;
          }
        }
        
        // 初期読み込み開始
        isInitializingRef.current = true;
        
        const blocks = await editor.tryParseMarkdownToBlocks(activeTab.content);
        editor.replaceBlocks(editor.document, blocks);
        
        // 読み込んだタブIDを記録
        lastLoadedTabIdRef.current = activeTab.id;
        
        // 初期読み込み完了（onChangeが非同期で発火する可能性があるため、少し遅延させる）
        setTimeout(() => {
          isInitializingRef.current = false;
        }, 100);
      } catch (error) {
        console.error('Failed to load markdown content:', error);
        isInitializingRef.current = false;
      }
    }

    loadContent();
    // activeTab?.contentを依存配列から削除（IME入力中の再レンダリングを防ぐ）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, activeTab?.id]);

  // エディタの変更を検知してタブのコンテンツを更新
  useEffect(() => {
    if (!editor || !activeTab) return;

    const cleanup = editor.onChange(async () => {
      // 初期読み込み中は変更検知を無視
      if (isInitializingRef.current) {
        return;
      }
      
      try {
        const markdownContent = await editor.blocksToMarkdownLossy(editor.document);
        tabStore.updateTabContent(activeTab.id, markdownContent);
      } catch (error) {
        console.error('Failed to convert blocks to markdown:', error);
      }
    });

    return () => {
      cleanup();
    };
  }, [editor, activeTab]);

  // Handle cursor movement from Toolbar
  useEffect(() => {
    if (!editor || !lastCursorMove.direction) return;

    // Ensure editor has focus
    if (!editor.domElement?.contains(document.activeElement)) {
        editor.domElement?.focus();
    }

    // We use the Selection API's modify method which is widely supported for caret movement
    // standard synthetic KeyboardEvents do NOT trigger default browser actions (like moving cursor).
    const selection = window.getSelection();
    
    // Define extended interface for non-standard modify method
    interface ExtendedSelection extends Selection {
        modify(alter: 'move' | 'extend', direction: 'forward' | 'backward' | 'left' | 'right', granularity: 'character' | 'word' | 'sentence' | 'line' | 'paragraph' | 'lineboundary' | 'sentenceboundary' | 'paragraphboundary' | 'documentboundary'): void;
    }

    if (selection && (selection as unknown as ExtendedSelection).modify) {
        const direction = lastCursorMove.direction === 'left' ? 'backward' : 'forward';
        (selection as unknown as ExtendedSelection).modify('move', direction, 'character');
        console.log(`Moved cursor ${direction}`);
    } else {
        console.warn('Selection API modify not supported');
    }

  }, [lastCursorMove, editor]);

  if (!editor) {
    return <div>Loading Editor...</div>;
  }

  return (
    <div className="h-full w-full overflow-hidden bg-background p-4">
      <Editor editor={editor} theme="light" />
    </div>
  );
}
