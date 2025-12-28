import { useEffect } from 'react';
import type { BlockNoteEditor } from '@blocknote/core';
import type { Tab } from '@/features/editor/domain/models/tab-state';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import {
  shouldLoadContent,
  shouldApplyExternalUpdate,
  type ContentLoadContext,
  type ExternalUpdateContext,
} from '@/features/editor/domain/services/content-load-decision-service';
import type { EditorState } from './use-editor-state';

/**
 * コンテンツ読み込み処理の結果
 */
interface LoadContentResult {
  success: boolean;
  error?: Error;
}

/**
 * コンテンツをエディタに読み込む
 */
async function loadContentToEditor(
  editor: BlockNoteEditor,
  content: string
): Promise<LoadContentResult> {
  try {
    const blocks = await editor.tryParseMarkdownToBlocks(content);
    editor.replaceBlocks(editor.document, blocks);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * タブ切り替え時のコンテンツ読み込み
 */
export function useTabContentLoader(
  editor: BlockNoteEditor | null,
  activeTab: Tab | undefined,
  state: EditorState
) {
  useEffect(() => {
    if (!editor || !activeTab?.content) return;

    async function loadContent() {
      if (!activeTab?.content) return;

      const isTabSwitched = state.lastLoadedTabId.current !== activeTab.id;

      // タブが切り替わっていない場合、現在のエディタの内容を取得
      let currentEditorContent = '';
      if (!isTabSwitched && editor) {
        try {
          currentEditorContent = await editor.blocksToMarkdownLossy(editor.document);
        } catch (error) {
          console.error('Failed to get current editor content:', error);
          return;
        }
      }

      const context: ContentLoadContext = {
        isTabSwitched,
        isComposing: state.isComposing.current,
        isInitializing: state.isInitializing.current,
        currentEditorContent,
        tabContent: activeTab.content,
      };

      if (!shouldLoadContent(context)) {
        return;
      }

      // 初期読み込み開始
      state.isInitializing.current = true;

      if (!editor) {
        state.isInitializing.current = false;
        return;
      }

      const result = await loadContentToEditor(editor, activeTab.content);
      if (!result.success) {
        console.error('Failed to load markdown content:', result.error);
        state.isInitializing.current = false;
        return;
      }

      // 読み込んだタブIDと内容を記録
      state.lastLoadedTabId.current = activeTab.id;
      state.lastLoadedContent.current = activeTab.content;

      // 初期読み込み完了
      setTimeout(() => {
        state.isInitializing.current = false;
      }, 100);
    }

    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, activeTab?.id]);
}

/**
 * 外部からの更新（プルなど）を検知してコンテンツを読み込む
 */
export function useExternalContentLoader(
  editor: BlockNoteEditor | null,
  activeTab: Tab | undefined,
  state: EditorState
) {
  useEffect(() => {
    if (!editor || !activeTab?.id) return;

    const handleStoreChange = async () => {
      const latestState = tabStore.getSnapshot();
      const currentTab = latestState.tabs.find((tab) => tab.id === activeTab.id);
      if (!currentTab?.content) {
        return;
      }

      const isTabSwitched = state.lastLoadedTabId.current !== currentTab.id;

      // 現在のエディタの内容を取得
      if (!editor) {
        return;
      }

      let currentEditorContent = '';
      try {
        currentEditorContent = await editor.blocksToMarkdownLossy(editor.document);
      } catch (error) {
        console.error('Failed to get current editor content:', error);
        return;
      }

      const context: ExternalUpdateContext = {
        isTabSwitched,
        isComposing: state.isComposing.current,
        isInitializing: state.isInitializing.current,
        lastLoadedContent: state.lastLoadedContent.current,
        tabContent: currentTab.content,
        currentEditorContent,
      };

      if (!shouldApplyExternalUpdate(context)) {
        // エディタからの変更の場合、lastLoadedContentRefを更新
        if (currentEditorContent.trim() === currentTab.content.trim()) {
          state.lastLoadedContent.current = currentTab.content;
        }
        return;
      }

      // 初期読み込み開始
      state.isInitializing.current = true;

      const result = await loadContentToEditor(editor, currentTab.content);
      if (!result.success) {
        console.error('Failed to load markdown content from external update:', result.error);
        state.isInitializing.current = false;
        return;
      }

      // 読み込んだ内容を記録
      state.lastLoadedContent.current = currentTab.content;

      // 初期読み込み完了
      setTimeout(() => {
        state.isInitializing.current = false;
      }, 100);
    };

    const unsubscribe = tabStore.subscribe(handleStoreChange);

    return () => {
      unsubscribe();
    };
  }, [editor, activeTab?.id, state]);
}

