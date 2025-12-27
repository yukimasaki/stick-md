'use client';

import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * サイドバーの背景オーバーレイコンポーネント
 * モバイル/タブレット時のみ表示され、サイドバーが開いている時に背景を暗くします
 */
export function SidebarOverlay() {
  const { isOpen, close } = useSidebar();
  const isMobile = useIsMobile();

  // モバイル時のみ表示
  if (!isMobile || !isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
      onClick={close}
      aria-hidden="true"
    />
  );
}

