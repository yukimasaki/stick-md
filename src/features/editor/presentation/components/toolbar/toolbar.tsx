'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEditor } from '@/features/editor/presentation/hooks/use-editor';
import { useIsMobile } from '@/hooks/use-mobile';

export function Toolbar() {
  const { actions } = useEditor();
  const isMobile = useIsMobile();

  // PCでは非表示
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-center gap-4 rounded-full bg-accent/80 p-2 shadow-lg backdrop-blur-sm">
      <button
        onClick={() => actions.moveCursor('left')}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm transition-colors hover:bg-accent active:scale-95"
        aria-label="Move Cursor Left"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div className="h-8 w-px bg-border/50" />

      <button
        onClick={() => actions.moveCursor('right')}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm transition-colors hover:bg-accent active:scale-95"
        aria-label="Move Cursor Right"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
