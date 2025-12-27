'use client';

import { Menu, User, LogOut, ChevronDown, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuBar } from '@/features/editor/presentation/components/menu-bar';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { login, logout } from '@/app/_actions/auth';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RepositorySelector } from '@/features/repository/presentation/components/repository-selector';
import type { Session } from 'next-auth';

interface AppHeaderProps {
  session: Session | null;
}

/**
 * PC/Mobile共通のヘッダーコンポーネント
 * PC: MenuBar + ユーザーメニュー
 * Mobile: ハンバーガーメニュー、ロゴ、ユーザーメニュー/ログインボタン
 */
export function AppHeader({ session }: AppHeaderProps) {
  const { toggle } = useSidebar();
  const isMobile = useIsMobile();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showRepositoryDialog, setShowRepositoryDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  return (
    <>
      <header
        className={cn(
          'fixed z-50',
          'bg-background border-b',
          'flex items-center',
          'rounded-lg shadow-lg',
          isMobile 
            ? 'h-12 px-4 top-4 left-4 right-4' // モバイル: 上下左右に余白、角丸
            : 'h-9 top-0 left-0 right-0 rounded-b-none' // PC: 上部固定、角丸なし
        )}
      >
        {isMobile ? (
          // モバイル: ハンバーガーメニュー、ロゴ、ユーザーメニュー/ログインボタン
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-9 w-9"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 flex items-center justify-center">
              <span className="text-sm font-semibold">Stick MD</span>
            </div>
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                      "hover:bg-accent active:bg-accent/80 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      "cursor-pointer touch-manipulation"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {session.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-6 h-6 rounded-full shrink-0" />
                      ) : (
                        <User className="w-6 h-6 shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate hidden sm:inline">{session.user?.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {session.user?.name || "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowRepositoryDialog(true)}
                  >
                    <GitBranch className="h-4 w-4" />
                    <span>Select repository</span>
                  </DropdownMenuItem>
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
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => login()}
                className="h-8"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="text-xs">ログイン</span>
              </Button>
            )}
          </>
        ) : (
          // PC: MenuBar + ユーザーメニュー
          <div className="w-full flex items-center">
            <div className="flex-1">
              <MenuBar />
            </div>
            <div className="pr-4">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                        "hover:bg-accent active:bg-accent/80 transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "cursor-pointer"
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
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      {session.user?.name || "User"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowRepositoryDialog(true)}
                    >
                      <GitBranch className="h-4 w-4" />
                      <span>Select repository</span>
                    </DropdownMenuItem>
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
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => login()}
                  className="h-8"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-xs">ログイン</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

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

      {/* リポジトリ選択ダイアログ */}
      <Dialog open={showRepositoryDialog} onOpenChange={setShowRepositoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select repository</DialogTitle>
            <DialogDescription>
              {session ? (
                "リポジトリを選択してください"
              ) : (
                "リポジトリを選択するにはサインインが必要です"
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {session ? (
              <RepositorySelector accessToken={session.accessToken as string | undefined} />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Please sign in to select a repository.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

