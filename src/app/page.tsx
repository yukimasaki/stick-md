import { AppSidebar } from "@/features/repository/presentation/components/app-sidebar"
import { EditorContainer } from '@/features/editor/presentation/components/editor-container';
import { MenuBar } from '@/features/editor/presentation/components/menu-bar';
import { SidebarToggleButton } from '@/features/shared/presentation/components/sidebar-toggle-button';
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
          {/* Menu Bar (PC only) - 画面全幅に表示 */}
          <div className="hidden lg:block border-b">
            <MenuBar />
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar session={session} />
            
            <MainContentWrapper>
              <EditorContainer />
            </MainContentWrapper>
          </div>
          
          {/* Floating Sidebar Trigger (Bottom Left) */}
          <SidebarToggleButton />
        </div>
      </SidebarProvider>
    </RepositoryProvider>
  );
}
