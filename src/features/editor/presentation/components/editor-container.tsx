'use client';

import dynamic from 'next/dynamic';
import { Toolbar } from '@/features/editor/presentation/components/toolbar/toolbar';

const MarkdownEditor = dynamic(() => import('@/features/editor/presentation/components/markdown-editor/markdown-editor').then(mod => mod.MarkdownEditor), { ssr: false });

export function EditorContainer() {
  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative">
        <MarkdownEditor />
      </div>

      {/* Floating Toolbar (Cursor) */}
      <Toolbar />
    </main>
  );
}
