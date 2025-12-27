'use client';

import { Folder, Github } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExplorerContent } from "@/features/repository/presentation/components/explorer-content"
import { RepositoryContent } from "@/features/repository/presentation/components/repository-content"
import { MobileSaveButton } from "@/features/editor/presentation/components/mobile-save-button"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/features/shared/presentation/contexts/sidebar-context"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Session } from "next-auth"

interface AppSidebarProps {
  session: Session | null
}

export function AppSidebar({ session }: AppSidebarProps) {
  const { isOpen, close } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <aside
      className={cn(
        "fixed z-40 bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        "flex flex-col transition-transform duration-300 ease-in-out",
        // PC: 常時表示、左側固定
        // モバイル: 左側からスライドイン、オーバーレイ付き（画面の80-90%の幅）
        // モバイル時のナビゲーションバー高さ: h-12 (48px)
        isMobile 
          ? "w-[85%] max-w-sm top-[calc(3rem+1rem)] bottom-4 left-0 rounded-lg shadow-lg" // モバイル: 画面の85%幅、ナビゲーションバー(48px) + 余白(16px)を考慮、角丸、影
          : "w-80 top-[36px] bottom-0 left-0", // PC: 左側、固定幅
        isMobile 
          ? (isOpen ? "ml-4 translate-x-0" : "-translate-x-[calc(100%+1rem)]") // モバイル: 左側から、閉じた時は完全に隠す
          : "translate-x-0" // PC: 常時表示
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
            <ExplorerContent session={session} />
          </TabsContent>

          <TabsContent value="repository" className="mt-0 flex-1 overflow-y-auto">
            <RepositoryContent session={session} />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  )
}

