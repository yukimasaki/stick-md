import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/repository/presentation/components/app-sidebar"
import { FileExplorerSidebar } from "@/features/repository/presentation/components/file-explorer-sidebar"
import { EditorContainer } from '@/features/editor/presentation/components/editor-container';
import { Menu } from 'lucide-react';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  return (
    <SidebarProvider>
      <FileExplorerSidebar />
      <SidebarInset>
        <EditorContainer />
        
        {/* Floating Sidebar Trigger (Bottom Right) */}
        <div className="fixed bottom-6 right-6 z-50">
            <SidebarTrigger className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Menu className="h-6 w-6" />
            </SidebarTrigger>
        </div>
      </SidebarInset>
      
      <AppSidebar session={session} />
    </SidebarProvider>
  );
}
