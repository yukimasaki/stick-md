'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';

export function SidebarToggleButton() {
  const { toggle, isOpen } = useSidebar();

  // サイドバーが開いている時は非表示
  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        onClick={toggle}
        className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        aria-label="Toggle Sidebar"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  );
}

