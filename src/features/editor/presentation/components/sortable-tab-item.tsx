'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tab } from '@/features/editor/domain/models/tab-state';

interface SortableTabItemProps {
  tab: Tab;
  isActive: boolean;
  onTabClick: (tabId: string) => void;
  onTabClose: (e: React.MouseEvent, tabId: string) => void;
}

export function SortableTabItem({
  tab,
  isActive,
  onTabClick,
  onTabClose,
}: SortableTabItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-sm font-medium transition-colors cursor-pointer',
        'hover:bg-accent',
        isActive
          ? 'bg-background border-b-2 border-b-primary text-foreground'
          : 'text-muted-foreground border-b border-transparent',
        isDragging && 'opacity-50'
      )}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTabClick(tab.id);
        }
      }}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
    >
      <span
        className="truncate max-w-[200px] flex-1"
        onClick={() => onTabClick(tab.id)}
      >
        {tab.title}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTabClose(e, tab.id);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        className={cn(
          'transition-opacity',
          'hover:bg-accent rounded p-0.5 shrink-0'
        )}
        aria-label="Close tab"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

