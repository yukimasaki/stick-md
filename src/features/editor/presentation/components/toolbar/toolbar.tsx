'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEditor } from '@/features/editor/presentation/hooks/use-editor';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import { cn } from '@/lib/utils';

export function Toolbar() {
  const { actions } = useEditor();
  const { isOpen } = useSidebar();

  return (
    <div
      className={cn(
        "fixed bottom-6 flex -translate-x-1/2 items-center justify-center gap-4 rounded-full bg-accent/80 p-2 shadow-lg backdrop-blur-sm transition-all duration-300",
        // サイドバーが開いている場合: エディタ領域の中央（画面中央 + サイドバー幅の半分）
        // サイドバーが閉じている場合: 画面中央
        isOpen ? "left-[calc(50%+10rem)]" : "left-1/2"
      )}
    >
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
