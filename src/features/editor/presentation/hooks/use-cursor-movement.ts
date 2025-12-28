import { useEffect } from 'react';
import type { BlockNoteEditor } from '@blocknote/core';

/**
 * カーソル移動の型定義
 */
interface CursorMove {
  direction: 'left' | 'right' | null;
  timestamp: number;
}

/**
 * カーソル移動の処理
 */
export function useCursorMovement(
  editor: BlockNoteEditor | null,
  lastCursorMove: CursorMove
) {
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
      modify(
        alter: 'move' | 'extend',
        direction: 'forward' | 'backward' | 'left' | 'right',
        granularity:
          | 'character'
          | 'word'
          | 'sentence'
          | 'line'
          | 'paragraph'
          | 'lineboundary'
          | 'sentenceboundary'
          | 'paragraphboundary'
          | 'documentboundary'
      ): void;
    }

    if (selection && (selection as unknown as ExtendedSelection).modify) {
      const direction = lastCursorMove.direction === 'left' ? 'backward' : 'forward';
      (selection as unknown as ExtendedSelection).modify('move', direction, 'character');
      console.log(`Moved cursor ${direction}`);
    } else {
      console.warn('Selection API modify not supported');
    }
  }, [lastCursorMove, editor]);
}

