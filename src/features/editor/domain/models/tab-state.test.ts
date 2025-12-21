import { describe, it, expect } from 'vitest';
import { createEmptyTabState } from './tab-state';

describe('tab-state', () => {
  describe('createEmptyTabState', () => {
    it('空のタブ状態を正しく作成する', () => {
      const state = createEmptyTabState();
      
      expect(state).toEqual({
        tabs: [],
        activeTabId: null,
        visibleTabIds: [],
      });
    });

    it('毎回新しいオブジェクトを返す', () => {
      const state1 = createEmptyTabState();
      const state2 = createEmptyTabState();
      
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });
});

