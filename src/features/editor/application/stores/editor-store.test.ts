import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEditorStoreV2 } from '@/features/editor/application/stores/editor-store';
// Note: importing createEditorStoreV2 as created in editor-store.ts, or verify export name.
// Checking previous file content, it was exported as createEditorStoreV2 but the default export/const instance uses it.
// Assuming we should test createEditorStoreV2 directly or rename it properly in refactor. 
// For now, I will import createEditorStoreV2 and rename in test for clarity.

describe('EditorStore', () => {
  let store: ReturnType<typeof createEditorStoreV2>;

  beforeEach(() => {
    store = createEditorStoreV2();
  });

  it('should verify initial state', () => {
    const snapshot = store.getSnapshot();
    expect(snapshot.lastCursorMove).toEqual({ direction: null, timestamp: 0 });
    expect(snapshot.toolbarOpen).toBe(false);
  });

  it('should update lastCursorMove state', () => {
    const listener = vi.fn();
    store.subscribe(listener);

    store.moveCursor('left');

    expect(listener).toHaveBeenCalled();
    const snapshot = store.getSnapshot();
    expect(snapshot.lastCursorMove.direction).toBe('left');
    expect(snapshot.lastCursorMove.timestamp).toBeGreaterThan(0);
  });

  it('should toggle toolbar', () => {
    store.toggleToolbar();
    expect(store.getSnapshot().toolbarOpen).toBe(true);
    store.toggleToolbar();
    expect(store.getSnapshot().toolbarOpen).toBe(false);
  });
});
