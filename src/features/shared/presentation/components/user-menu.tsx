'use client';

import { User, LogOut, GitBranch } from 'lucide-react';
import { useState } from 'react';
import { login, logout } from '@/app/_actions/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RepositorySelector } from '@/features/repository/presentation/components/repository-selector';
import type { Session } from 'next-auth';

interface UserMenuProps {
  session: Session | null;
  /**
   * アバターのみ表示するか（ユーザー名を非表示）
   * @default false
   */
  avatarOnly?: boolean;
  /**
   * ボタンの追加クラス名
   */
  buttonClassName?: string;
}

/**
 * ユーザーメニューコンポーネント（アバター + ドロップダウン + ダイアログ）
 */
export function UserMenu({ session, avatarOnly = false, buttonClassName }: UserMenuProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showRepositoryDialog, setShowRepositoryDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  return (
    <>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'group flex items-center rounded-md p-1',
                'hover:bg-accent active:bg-accent/80 transition-colors',
                'focus:outline-none',
                'cursor-pointer',
                buttonClassName
              )}
            >
              {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full shrink-0 border border-gray-300 p-px bg-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full shrink-0 border border-gray-300 p-px bg-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{session.user?.name || 'User'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowRepositoryDialog(true)}>
              <GitBranch className="h-4 w-4" />
              <span>Select repository</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setShowLogoutDialog(true)}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" size="sm" onClick={() => login()} className="h-8">
          <User className="h-4 w-4 mr-2" />
          <span className="text-xs">ログイン</span>
        </Button>
      )}

      {/* サインアウト確認ダイアログ */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>サインアウトの確認</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
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
              {session
                ? 'リポジトリを選択してください'
                : 'リポジトリを選択するにはサインインが必要です'}
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

