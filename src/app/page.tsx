import { AppSidebar } from "@/features/repository/presentation/components/app-sidebar"
import { EditorContainer } from '@/features/editor/presentation/components/editor-container';
import { SidebarToggleButton } from '@/features/shared/presentation/components/sidebar-toggle-button';
import { SidebarProvider } from '@/features/shared/presentation/contexts/sidebar-context';
import { MainContentWrapper } from '@/features/shared/presentation/components/main-content-wrapper';
import { RepositoryProvider } from '@/features/repository/presentation/components/repository-provider';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  return (
    <RepositoryProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar session={session} />
          
          <MainContentWrapper>
            <EditorContainer />
          </MainContentWrapper>
          
          {/* Floating Sidebar Trigger (Bottom Left) */}
          <SidebarToggleButton />
        </div>
      </SidebarProvider>
    </RepositoryProvider>
  );
}
