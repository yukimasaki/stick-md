'use client';

import { Folder, Github } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExplorerContent } from "@/features/repository/presentation/components/explorer-content"
import { RepositoryContent } from "@/features/repository/presentation/components/repository-content"
import { SaveButton } from "@/features/editor/presentation/components/save-button"
import { BrandLogo } from "@/features/shared/presentation/components/brand-logo"
import { UserMenuDialog } from "@/features/shared/presentation/components/user-menu-dialog"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/features/shared/presentation/contexts/sidebar-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "next-intl"
import type { Session } from "next-auth"

interface AppSidebarProps {
  session: Session | null
}

/**
 * サイドバーのスタイルクラスを計算
 */
function getSidebarClassName(isMobile: boolean) {
  return cn(
    "fixed z-[60] bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
    "flex flex-col",
    // PC: 常時表示、左側固定
    // モバイル: 左側からスライドイン、オーバーレイ付き（画面の80-90%の幅）
    isMobile
      ? "w-[85%] max-w-sm top-4 bottom-4 left-4 rounded-lg shadow-lg" // モバイル: ヘッダーと同じ上部余白、画面の85%幅、角丸、影
      : "w-80 top-0 bottom-0 left-0" // PC: 左側、固定幅、上部から
  );
}

export function AppSidebar({ session }: AppSidebarProps) {
  const t = useTranslations();
  const { isOpen, close } = useSidebar();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('explorer');
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでマウントされたことを確認（Hydrationエラーを防ぐ）
  useEffect(() => {
    setMounted(true);
  }, []);

  // サイドバータブ切り替えイベントをリッスン
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent<{ tab: string }>) => {
      if (event.detail.tab === 'explorer' || event.detail.tab === 'repository') {
        setActiveTab(event.detail.tab);
      }
    };

    window.addEventListener('switch-sidebar-tab', handleSwitchTab as EventListener);
    return () => {
      window.removeEventListener('switch-sidebar-tab', handleSwitchTab as EventListener);
    };
  }, []);

  // マウント前は何も表示しない（Hydrationエラーを防ぐ）
  if (!mounted) {
    return null;
  }

  // PCの場合は常に表示（アニメーションなし）
  if (!isMobile) {
    return (
      <aside className={getSidebarClassName(isMobile)}>
        {/* サイドバーヘッダー */}
        <div className="p-4 border-b flex items-center justify-start">
          <BrandLogo />
        </div>

        {/* サイドバーコンテンツ */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            {/* Save Button (PC/Mobile共通) */}
            <div className="p-2 border-b">
              <SaveButton />
            </div>
            <div className="p-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="explorer" className="flex items-center justify-center gap-1.5 min-w-0">
                  <Folder className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('sidebar.explorer')}</span>
                </TabsTrigger>
                <TabsTrigger value="repository" className="flex items-center justify-center gap-1.5 min-w-0">
                  <Github className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('sidebar.repository')}</span>
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
        <div className="p-4 border-t flex items-center justify-start">
          <UserMenuDialog session={session} avatarOnly />
        </div>
      </aside>
    );
  }

  // モバイルの場合はFramer Motionでアニメーション
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '-100%' }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={getSidebarClassName(isMobile)}
        >
          {/* サイドバーヘッダー */}
          <div className="p-4 border-b flex items-center justify-start">
            <BrandLogo onClick={close} />
          </div>

          {/* サイドバーコンテンツ */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              {/* Save Button (PC/Mobile共通) */}
              <div className="p-2 border-b">
                <SaveButton />
              </div>
              <div className="p-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="explorer" className="flex items-center justify-center gap-1.5 min-w-0">
                    <Folder className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t('sidebar.explorer')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="repository" className="flex items-center justify-center gap-1.5 min-w-0">
                    <Github className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t('sidebar.repository')}</span>
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
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

