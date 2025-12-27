'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/features/shared/presentation/components/brand-logo';
import { UserMenu } from '@/features/shared/presentation/components/user-menu';
import type { Session } from 'next-auth';

interface AppHeaderProps {
  session: Session | null;
}

/**
 * PC/Mobile共通のヘッダーコンポーネント
 * PC (1024px以上): ユーザーメニューのみ
 * Mobile/Tablet (1024px未満): ハンバーガーメニュー、ロゴ、ユーザーメニュー/ログインボタン
 */
export function AppHeader({ session }: AppHeaderProps) {
  const { toggle } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null; // PC時はヘッダーを表示しない
  }

  return (
    <header
      className={cn(
        'fixed z-50',
        'bg-background border-b',
        'flex items-center',
        'rounded-lg shadow-lg',
        'h-12 px-4 top-4 left-4 right-4 max-w-[425px] mx-auto' // モバイル/タブレット: 上下左右に余白、角丸、最大幅425px
      )}
    >
      {/* モバイル: ハンバーガーメニュー、ロゴ、ユーザーメニュー/ログインボタン */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="h-10 w-10"
        aria-label="Toggle Sidebar"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex-1 flex items-center justify-center">
        <BrandLogo />
      </div>

      <UserMenu
        session={session}
        avatarOnly
        buttonClassName="px-2 py-1.5 text-sm touch-manipulation"
      />
    </header>
  );
}

