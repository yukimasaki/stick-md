'use client';

import { useSyncExternalStore } from 'react';
import { X, Layers } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import { SortableTabItem } from './sortable-tab-item';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function TabBar() {
  const state = useSyncExternalStore(
    tabStore.subscribe,
    tabStore.getSnapshot,
    tabStore.getSnapshot
  );

  const visibleTabs = state.tabs.filter(tab => state.visibleTabIds.includes(tab.id));
  const hiddenTabs = state.tabs.filter(tab => !state.visibleTabIds.includes(tab.id));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px以上移動した場合のみドラッグを開始
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTabClick = (tabId: string) => {
    tabStore.setActiveTab(tabId);
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    tabStore.closeTab(tabId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = state.visibleTabIds.indexOf(active.id as string);
    const newIndex = state.visibleTabIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      // visibleTabIdsの順序を更新
      const newVisibleTabIds = arrayMove(state.visibleTabIds, oldIndex, newIndex);
      
      // 全タブの順序を更新（visibleTabIdsの順序に従って）
      const allTabIds = [
        ...newVisibleTabIds,
        ...state.tabs
          .filter(tab => !newVisibleTabIds.includes(tab.id))
          .map(tab => tab.id)
      ];
      
      tabStore.reorderTabs(allTabIds);
    }
  };

  if (state.tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 border-b bg-background px-2 py-1">
      {/* 表示中のタブ（横スクロール可能、ドラッグ&ドロップ対応） */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={state.visibleTabIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
            {visibleTabs.map((tab) => (
              <SortableTabItem
                key={tab.id}
                tab={tab}
                isActive={state.activeTabId === tab.id}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* メニューボタン（4つ目以降のタブ） */}
      {hiddenTabs.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0 relative"
              aria-label="Show more tabs"
            >
              <Layers className="h-4 w-4" />
              <Badge
                variant="secondary"
                className="absolute top-0 right-0 h-2 min-w-2 px-0.5 text-[8px] leading-none flex items-center justify-center"
              >
                {hiddenTabs.length}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="space-y-1">
              {hiddenTabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => {
                    handleTabClick(tab.id);
                  }}
                  className={cn(
                    'group w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer',
                    'hover:bg-accent',
                    state.activeTabId === tab.id && 'bg-accent'
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTabClick(tab.id);
                    }
                  }}
                >
                  <span className="truncate flex-1 text-left">{tab.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabClose(e, tab.id);
                    }}
                    className="hover:bg-accent rounded p-0.5 shrink-0"
                    aria-label="Close tab"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

