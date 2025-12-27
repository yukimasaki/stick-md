import { AppSidebar } from "@/features/shared/presentation/components/app-sidebar"
import { EditorContainer } from '@/features/editor/presentation/components/editor-container';
import { AppHeader } from '@/features/shared/presentation/components/app-header';
import { SidebarOverlay } from '@/features/shared/presentation/components/sidebar-overlay';
import { SidebarProvider } from '@/features/shared/presentation/contexts/sidebar-context';
import { MainContentWrapper } from '@/features/shared/presentation/components/main-content-wrapper';
import { RepositoryProvider } from '@/features/repository/presentation/components/repository-provider';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  return (
    <RepositoryProvider accessToken={session?.accessToken as string | undefined}>
      <SidebarProvider>
        <div className="flex h-screen w-full flex-col overflow-hidden">
          {/* App Header (PC/Mobile共通) */}
          <AppHeader session={session} />
          
          <div className="flex flex-1 overflow-hidden pt-16 lg:pt-0">
            <AppSidebar session={session} />
            <SidebarOverlay />
            
            <MainContentWrapper>
              <EditorContainer />
            </MainContentWrapper>
          </div>
        </div>
      </SidebarProvider>
    </RepositoryProvider>
  );
}
