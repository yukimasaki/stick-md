'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCreateBlockNote } from '@blocknote/react';
import { useEditor } from '@/features/editor/presentation/hooks/use-editor';

// Dynamic import of the wrapper component
const Editor = dynamic(() => import('./editor-wrapper'), { ssr: false });

export function MarkdownEditor() {
  const editor = useCreateBlockNote();
  const { lastCursorMove } = useEditor();

  // Handle cursor movement from Toolbar
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
        modify(alter: 'move' | 'extend', direction: 'forward' | 'backward' | 'left' | 'right', granularity: 'character' | 'word' | 'sentence' | 'line' | 'paragraph' | 'lineboundary' | 'sentenceboundary' | 'paragraphboundary' | 'documentboundary'): void;
    }

    if (selection && (selection as unknown as ExtendedSelection).modify) {
        const direction = lastCursorMove.direction === 'left' ? 'backward' : 'forward';
        (selection as unknown as ExtendedSelection).modify('move', direction, 'character');
        console.log(`Moved cursor ${direction}`);
    } else {
        console.warn('Selection API modify not supported');
    }

  }, [lastCursorMove, editor]);

  if (!editor) {
    return <div>Loading Editor...</div>;
  }

  return (
    <div className="h-full w-full overflow-hidden bg-background p-4">
      <Editor editor={editor} theme="light" />
    </div>
  );
}
