'use client';

import { useSyncExternalStore } from 'react';
import { editorStore } from '@/features/editor/application/stores/editor-store';

export function useEditor() {
  const store = useSyncExternalStore(
    editorStore.subscribe,
    editorStore.getSnapshot,
    editorStore.getSnapshot
  );

  return {
    ...store,
    actions: {
      toggleToolbar: editorStore.toggleToolbar,
      moveCursor: editorStore.moveCursor,
    }
  };
}
