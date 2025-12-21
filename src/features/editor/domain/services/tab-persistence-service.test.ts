import { describe, it, expect } from 'vitest';
import * as E from 'fp-ts/Either';
import { validateTabState } from './tab-persistence-service';
import type { TabState } from '@/features/editor/domain/models/tab-state';

describe('tab-persistence-service', () => {
  describe('validateTabState', () => {
    it('有効なTabStateを正しく検証する', () => {
      const validState: TabState = {
        tabs: [
          {
            id: 'repo1:file1.md',
            filePath: 'file1.md',
            repositoryId: 'repo1',
            title: 'file1.md',
          },
        ],
        activeTabId: 'repo1:file1.md',
        visibleTabIds: ['repo1:file1.md'],
      };

      const result = validateTabState(validState);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(validState);
      }
    });

    it('nullを拒否する', () => {
      const result = validateTabState(null);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });

    it('undefinedを拒否する', () => {
      const result = validateTabState(undefined);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });

    it('配列を拒否する', () => {
      const result = validateTabState([]);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });

    it('tabsが配列でない場合を拒否する', () => {
      const result = validateTabState({
        tabs: 'not-an-array',
        activeTabId: null,
        visibleTabIds: [],
      });
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });

    it('activeTabIdが存在しない場合を拒否する', () => {
      const result = validateTabState({
        tabs: [],
        visibleTabIds: [],
      } as unknown as TabState);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });

    it('activeTabIdがstringまたはnullでない場合を拒否する', () => {
      const result = validateTabState({
        tabs: [],
        activeTabId: 123,
        visibleTabIds: [],
      } as unknown as TabState);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });

    it('visibleTabIdsが配列でない場合を拒否する', () => {
      const result = validateTabState({
        tabs: [],
        activeTabId: null,
        visibleTabIds: 'not-an-array',
      } as unknown as TabState);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });

    it('タブの必須フィールドが欠けている場合を拒否する', () => {
      const result = validateTabState({
        tabs: [
          {
            id: 'tab1',
            // filePath, repositoryId, title が欠けている
          },
        ],
        activeTabId: null,
        visibleTabIds: [],
      } as unknown as TabState);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });

    it('visibleTabIdsの要素がstringでない場合を拒否する', () => {
      const result = validateTabState({
        tabs: [],
        activeTabId: null,
        visibleTabIds: [123, 'valid'],
      } as unknown as TabState);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_DATA');
      }
    });
  });
});

