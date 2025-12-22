'use client';

import { LogOut, User, Folder, Github } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExplorerContent } from "@/features/repository/presentation/components/explorer-content"
import { RepositoryContent } from "@/features/repository/presentation/components/repository-content"
import { MobileSaveButton } from "@/features/editor/presentation/components/mobile-save-button"
import { logout } from "@/app/_actions/auth"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/features/shared/presentation/contexts/sidebar-context"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Session } from "next-auth"

interface AppSidebarProps {
  session: Session | null
}

export function AppSidebar({ session }: AppSidebarProps) {
  const { isOpen } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <aside
      className={cn(
        "fixed left-0 z-40 w-80 bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        "flex flex-col transition-transform duration-300 ease-in-out",
        // PC時はメニューバーの下（top-[36px]）、モバイル時は上端（top-0）
        isMobile ? "inset-y-0 h-screen" : "top-[36px] bottom-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* サイドバーコンテンツ */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Tabs defaultValue="explorer" className="w-full h-full flex flex-col">
          {/* Mobile Save Button */}
          {isMobile && (
            <div className="p-2 border-b">
              <MobileSaveButton />
            </div>
          )}
          <div className="p-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="explorer" className="flex items-center justify-center gap-1.5 min-w-0">
                <Folder className="h-4 w-4 shrink-0" />
                <span className="truncate">Explorer</span>
              </TabsTrigger>
              <TabsTrigger value="repository" className="flex items-center justify-center gap-1.5 min-w-0">
                <Github className="h-4 w-4 shrink-0" />
                <span className="truncate">Repository</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explorer" className="mt-0 flex-1 overflow-y-auto">
            <ExplorerContent />
          </TabsContent>

          <TabsContent value="repository" className="mt-0 flex-1 overflow-y-auto">
            <RepositoryContent session={session} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* フッター */}
      <div className="border-t border-sidebar-border mt-auto">
         {session ? (
            <div className="p-2">
                <div className="flex items-center gap-2 mb-2 px-2">
                    {session.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-6 h-6 rounded-full" />
                    ) : (
                        <User className="w-6 h-6" />
                    )}
                    <span className="text-sm font-medium truncate">{session.user?.name}</span>
                </div>
                <ul className="space-y-1">
                    <li>
                        <button
                            onClick={() => logout()}
                            className={cn(
                                "flex w-full items-center gap-2 rounded-md p-2 text-sm",
                                "text-red-500 hover:bg-sidebar-accent hover:text-red-600",
                                "transition-colors"
                            )}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                        </button>
                    </li>
                </ul>
            </div>
         ) : (
            <div className="text-xs text-muted-foreground p-4">
                Stick-MD v0.1.0
            </div>
         )}
      </div>
    </aside>
  )
}

