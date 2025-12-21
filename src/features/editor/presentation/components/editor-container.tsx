'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import { Toolbar } from '@/features/editor/presentation/components/toolbar/toolbar';
import { TabBar } from '@/features/editor/presentation/components/tab-bar';
import { tabStore } from '@/features/editor/application/stores/tab-store';

const MarkdownEditor = dynamic(() => import('@/features/editor/presentation/components/markdown-editor/markdown-editor').then(mod => mod.MarkdownEditor), { ssr: false });

export function EditorContainer() {
  const hasInitializedRef = useRef(false);
  const state = useSyncExternalStore(
    tabStore.subscribe,
    tabStore.getSnapshot,
    tabStore.getSnapshot
  );

  // タブストアの初期化（LocalStorageから読み込み）
  useEffect(() => {
    if (!hasInitializedRef.current) {
      tabStore.initialize();
      hasInitializedRef.current = true;
    }
  }, []);

  const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Tab Bar */}
      {state.tabs.length > 0 && <TabBar />}

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab ? (
          <MarkdownEditor key={activeTab.id} tabId={activeTab.id} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No file open
          </div>
        )}
      </div>

      {/* Floating Toolbar (Cursor) */}
      <Toolbar />
    </main>
  );
}
