import { useEffect } from 'react';
import type { BlockNoteEditor } from '@blocknote/core';
import type { Tab } from '@/features/editor/domain/models/tab-state';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import type { EditorState } from './use-editor-state';

/**
 * エディタの変更を検知してタブのコンテンツを更新
 */
export function useEditorChangeHandler(
  editor: BlockNoteEditor | null,
  activeTab: Tab | undefined,
  state: EditorState
) {
  useEffect(() => {
    if (!editor || !activeTab) return;

    const cleanup = editor.onChange(async () => {
      // 初期読み込み中は変更検知を無視
      if (state.isInitializing.current) {
        return;
      }

      // IME入力中は変更検知を無視（IME確定を防ぐ）
      if (state.isComposing.current) {
        return;
      }

      try {
        const markdownContent = await editor.blocksToMarkdownLossy(editor.document);
        // lastLoadedContentRefを即座に更新（handleStoreChangeでの判定を正確にするため）
        state.lastLoadedContent.current = markdownContent;
        tabStore.updateTabContent(activeTab.id, markdownContent);
      } catch (error) {
        console.error('Failed to convert blocks to markdown:', error);
      }
    });

    return () => {
      cleanup();
    };
  }, [editor, activeTab, state]);
}

