import { describe, it, expect } from 'vitest';
import {
  shouldLoadContent,
  shouldApplyExternalUpdate,
  type ContentLoadContext,
  type ExternalUpdateContext,
} from './content-load-decision-service';

describe('content-load-decision-service', () => {
  describe('shouldLoadContent', () => {
    it('タブが切り替わった場合は必ず読み込む', () => {
      const context: ContentLoadContext = {
        isTabSwitched: true,
        isComposing: false,
        isInitializing: false,
        currentEditorContent: 'old content',
        tabContent: 'new content',
      };

      expect(shouldLoadContent(context)).toBe(true);
    });

    it('IME入力中は読み込まない', () => {
      const context: ContentLoadContext = {
        isTabSwitched: false,
        isComposing: true,
        isInitializing: false,
        currentEditorContent: 'old content',
        tabContent: 'new content',
      };

      expect(shouldLoadContent(context)).toBe(false);
    });

    it('初期読み込み中は読み込まない', () => {
      const context: ContentLoadContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: true,
        currentEditorContent: 'old content',
        tabContent: 'new content',
      };

      expect(shouldLoadContent(context)).toBe(false);
    });

    it('現在の内容とタブの内容が同じ場合は読み込まない', () => {
      const context: ContentLoadContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: false,
        currentEditorContent: 'same content',
        tabContent: 'same content',
      };

      expect(shouldLoadContent(context)).toBe(false);
    });

    it('現在の内容とタブの内容が異なる場合は読み込む', () => {
      const context: ContentLoadContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: false,
        currentEditorContent: 'old content',
        tabContent: 'new content',
      };

      expect(shouldLoadContent(context)).toBe(true);
    });

    it('空白の違いは無視される', () => {
      const context: ContentLoadContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: false,
        currentEditorContent: '  same content  ',
        tabContent: 'same content',
      };

      expect(shouldLoadContent(context)).toBe(false);
    });
  });

  describe('shouldApplyExternalUpdate', () => {
    it('タブが切り替わった場合は適用しない', () => {
      const context: ExternalUpdateContext = {
        isTabSwitched: true,
        isComposing: false,
        isInitializing: false,
        lastLoadedContent: 'old content',
        tabContent: 'new content',
        currentEditorContent: 'old content',
      };

      expect(shouldApplyExternalUpdate(context)).toBe(false);
    });

    it('IME入力中は適用しない', () => {
      const context: ExternalUpdateContext = {
        isTabSwitched: false,
        isComposing: true,
        isInitializing: false,
        lastLoadedContent: 'old content',
        tabContent: 'new content',
        currentEditorContent: 'old content',
      };

      expect(shouldApplyExternalUpdate(context)).toBe(false);
    });

    it('初期読み込み中は適用しない', () => {
      const context: ExternalUpdateContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: true,
        lastLoadedContent: 'old content',
        tabContent: 'new content',
        currentEditorContent: 'old content',
      };

      expect(shouldApplyExternalUpdate(context)).toBe(false);
    });

    it('タブの内容が変更されていない場合は適用しない', () => {
      const context: ExternalUpdateContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: false,
        lastLoadedContent: 'same content',
        tabContent: 'same content',
        currentEditorContent: 'old content',
      };

      expect(shouldApplyExternalUpdate(context)).toBe(false);
    });

    it('現在の内容とタブの内容が同じ場合は適用しない（エディタからの変更）', () => {
      const context: ExternalUpdateContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: false,
        lastLoadedContent: 'old content',
        tabContent: 'new content',
        currentEditorContent: 'new content',
      };

      expect(shouldApplyExternalUpdate(context)).toBe(false);
    });

    it('外部からの更新の場合は適用する', () => {
      const context: ExternalUpdateContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: false,
        lastLoadedContent: 'old content',
        tabContent: 'external update',
        currentEditorContent: 'old content',
      };

      expect(shouldApplyExternalUpdate(context)).toBe(true);
    });

    it('lastLoadedContentがnullの場合、内容が変更されたとみなす', () => {
      const context: ExternalUpdateContext = {
        isTabSwitched: false,
        isComposing: false,
        isInitializing: false,
        lastLoadedContent: null,
        tabContent: 'new content',
        currentEditorContent: 'old content',
      };

      expect(shouldApplyExternalUpdate(context)).toBe(true);
    });
  });
});

