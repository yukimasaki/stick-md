import { useEffect } from 'react';
import type { BlockNoteEditor } from '@blocknote/core';
import type { Tab } from '@/features/editor/domain/models/tab-state';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import type { EditorState } from './use-editor-state';

/**
 * IME入力（composition）の処理
 */
export function useImeHandler(
  editor: BlockNoteEditor | null,
  activeTab: Tab | undefined,
  state: EditorState
) {
  useEffect(() => {
    if (!editor?.domElement || !activeTab) return;

    const handleCompositionStart = () => {
      state.isComposing.current = true;
    };

    const handleCompositionEnd = async () => {
      // composition終了後、エディタの内容を保存
      setTimeout(async () => {
        state.isComposing.current = false;

        try {
          const markdownContent = await editor.blocksToMarkdownLossy(editor.document);
          tabStore.updateTabContent(activeTab.id, markdownContent);
          // lastLoadedContentRefを更新（エディタからの変更として記録）
          state.lastLoadedContent.current = markdownContent;
        } catch (error) {
          console.error('Failed to save content after composition end:', error);
        }
      }, 100);
    };

    const element = editor.domElement;
    element.addEventListener('compositionstart', handleCompositionStart);
    element.addEventListener('compositionend', handleCompositionEnd);

    return () => {
      element.removeEventListener('compositionstart', handleCompositionStart);
      element.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [editor, activeTab, state]);
}

