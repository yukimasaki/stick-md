'use client';

import { LogOut, User, Folder, Github, X, ChevronDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExplorerContent } from "@/features/repository/presentation/components/explorer-content"
import { RepositoryContent } from "@/features/repository/presentation/components/repository-content"
import { MobileSaveButton } from "@/features/editor/presentation/components/mobile-save-button"
import { login, logout } from "@/app/_actions/auth"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/features/shared/presentation/contexts/sidebar-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Session } from "next-auth"

interface AppSidebarProps {
  session: Session | null
}

export function AppSidebar({ session }: AppSidebarProps) {
  const { isOpen, close } = useSidebar();
  const isMobile = useIsMobile();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 z-40 bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        "flex flex-col transition-transform duration-300 ease-in-out",
        // モバイル時は画面全幅、PC時は固定幅
        isMobile ? "w-full inset-y-0 h-screen" : "w-80 top-[36px] bottom-0",
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
            <ExplorerContent session={session} />
          </TabsContent>

          <TabsContent value="repository" className="mt-0 flex-1 overflow-y-auto">
            <RepositoryContent session={session} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* フッター */}
      <div className="border-t border-sidebar-border mt-auto">
         {session ? (
            <div className="p-3">
                <div className="flex items-center justify-between gap-3">
                    {/* 左カラム: Avatar+UserName をdropdown-menu化 */}
                    <div className="flex-1 min-w-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={cn(
                                        "group w-full flex items-center justify-between gap-2 min-w-0 rounded-md px-2 py-1.5 text-sm",
                                        "hover:bg-sidebar-accent active:bg-sidebar-accent/80 transition-colors",
                                        "focus:outline-none focus:ring-2 focus:ring-sidebar-accent focus:ring-offset-2 focus:ring-offset-sidebar",
                                        "cursor-pointer touch-manipulation" // モバイル向けタップ最適化
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {session.user?.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={session.user.image} alt={session.user.name || "User"} className="w-6 h-6 rounded-full shrink-0" />
                                        ) : (
                                            <User className="w-6 h-6 shrink-0" />
                                        )}
                                        <span className="text-sm font-medium truncate">{session.user?.name}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>
                                    {session.user?.name || "User"}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setShowLogoutDialog(true)}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {/* 右カラム: サイドバーを閉じるボタン */}
                    <button
                        onClick={close}
                        className={cn(
                            "shrink-0 h-9 w-9 rounded-md",
                            "flex items-center justify-center",
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                            "hover:bg-sidebar-accent",
                            "transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-sidebar-accent focus:ring-offset-2 focus:ring-offset-sidebar"
                        )}
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
         ) : (
            <div className="p-3">
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => login()}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm",
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                            "transition-colors"
                        )}
                    >
                        <User className="h-4 w-4" />
                        <span>Sign in</span>
                    </button>
                    <button
                        onClick={close}
                        className={cn(
                            "shrink-0 h-9 w-9 rounded-md",
                            "flex items-center justify-center",
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                            "hover:bg-sidebar-accent",
                            "transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-sidebar-accent focus:ring-offset-2 focus:ring-offset-sidebar"
                        )}
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
         )}
      </div>

      {/* サインアウト確認ダイアログ */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>サインアウトの確認</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              サインアウト
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}

