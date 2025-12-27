'use client';

import { Folder, Github } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExplorerContent } from "@/features/repository/presentation/components/explorer-content"
import { RepositoryContent } from "@/features/repository/presentation/components/repository-content"
import { SaveButton } from "@/features/editor/presentation/components/save-button"
import { BrandLogo } from "@/features/shared/presentation/components/brand-logo"
import { UserMenu } from "@/features/shared/presentation/components/user-menu"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/features/shared/presentation/contexts/sidebar-context"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Session } from "next-auth"

interface AppSidebarProps {
  session: Session | null
}

/**
 * サイドバーのスタイルクラスを計算
 */
function getSidebarClassName(isMobile: boolean, isOpen: boolean) {
  return cn(
    "fixed z-[60] bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
    "flex flex-col transition-transform duration-300 ease-in-out",
    // PC: 常時表示、左側固定
    // モバイル: 左側からスライドイン、オーバーレイ付き（画面の80-90%の幅）
    isMobile
      ? "w-[85%] max-w-sm top-4 bottom-4 left-0 rounded-lg shadow-lg" // モバイル: ヘッダーと同じ上部余白、画面の85%幅、角丸、影
      : "w-80 top-0 bottom-0 left-0", // PC: 左側、固定幅、上部から
    isMobile
      ? isOpen
        ? "ml-4 translate-x-0"
        : "-translate-x-[calc(100%+1rem)]" // モバイル: 左側から、閉じた時は完全に隠す
      : "translate-x-0" // PC: 常時表示
  );
}

export function AppSidebar({ session }: AppSidebarProps) {
  const { isOpen, close } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <aside className={getSidebarClassName(isMobile, isOpen)}>
      {/* サイドバーヘッダー */}
      <div className="p-4 border-b flex items-center justify-start">
        <BrandLogo onClick={isMobile ? close : undefined} />
      </div>

      {/* サイドバーコンテンツ */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Tabs defaultValue="explorer" className="w-full h-full flex flex-col">
          {/* Save Button (PC/Mobile共通) */}
          <div className="p-2 border-b">
            <SaveButton />
          </div>
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

      {/* サイドバーフッター（PC時のみ） */}
      {!isMobile && (
        <div className="p-4 border-t flex items-center justify-start">
          <UserMenu session={session} avatarOnly />
        </div>
      )}
    </aside>
  )
}

