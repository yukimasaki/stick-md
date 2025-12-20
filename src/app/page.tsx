'use client';

import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toolbar } from '@/features/editor/presentation/components/toolbar/toolbar';
import { Menu } from 'lucide-react';

const MarkdownEditor = dynamic(() => import('@/features/editor/presentation/components/markdown-editor/markdown-editor').then(mod => mod.MarkdownEditor), { ssr: false });

export default function Home() {
  return (
    <SidebarProvider>
      <SidebarInset>
        <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
          {/* Editor Area */}
          <div className="flex-1 overflow-hidden relative">
            <MarkdownEditor />
          </div>

          {/* Floating Toolbar (Cursor) */}
          <Toolbar />
        </main>
        
        {/* Floating Sidebar Trigger (Bottom Right) */}
        <div className="fixed bottom-6 right-6 z-50">
            <SidebarTrigger className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Menu className="h-6 w-6" />
            </SidebarTrigger>
        </div>
      </SidebarInset>
      
      <AppSidebar />
    </SidebarProvider>
  );
}
