

// Re-implementing with snapshot integration for simplicity with useSyncExternalStore
type Listener = () => void;

export const createEditorStoreV2 = () => {
  let state = {
    toolbarOpen: false,
    lastCursorMove: { direction: null as 'left' | 'right' | null, timestamp: 0 }
  };

  const listeners: Set<Listener> = new Set();
  const getSnapshot = () => state;
  const subscribe = (l: Listener) => { listeners.add(l); return () => listeners.delete(l); };
  const notify = () => listeners.forEach(l => l());

  const toggleToolbar = () => {
    state = { ...state, toolbarOpen: !state.toolbarOpen };
    notify();
  };

  const moveCursor = (direction: 'left' | 'right') => {
    state = {
      ...state,
      lastCursorMove: { direction, timestamp: Date.now() }
    };
    notify();
  };

  return { getSnapshot, subscribe, toggleToolbar, moveCursor };
};

export const editorStore = createEditorStoreV2();
