'use client';

import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuBar } from '@/features/editor/presentation/components/menu-bar';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { login } from '@/app/_actions/auth';
import { cn } from '@/lib/utils';
import type { Session } from 'next-auth';

interface AppHeaderProps {
  session: Session | null;
}

/**
 * PC/Mobile共通のヘッダーコンポーネント
 * PC: MenuBarを表示
 * Mobile: ハンバーガーメニュー、ロゴ、ログインボタンを表示
 */
export function AppHeader({ session }: AppHeaderProps) {
  const { toggle } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-background border-b',
        'flex items-center',
        isMobile ? 'h-12 px-4' : 'h-9'
      )}
    >
      {isMobile ? (
        // モバイル: ハンバーガーメニュー、ロゴ、ログインボタン
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
          
          {!session && (
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
        // PC: MenuBar
        <div className="w-full">
          <MenuBar />
        </div>
      )}
    </header>
  );
}

