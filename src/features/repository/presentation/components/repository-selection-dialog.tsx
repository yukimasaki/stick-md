'use client';

import { XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { RepositorySelector } from '@/features/repository/presentation/components/repository-selector';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import type { Session } from 'next-auth';

interface RepositorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
}

/**
 * リポジトリ選択ダイアログコンポーネント
 */
export function RepositorySelectionDialog({
  open,
  onOpenChange,
  session,
}: RepositorySelectionDialogProps) {
  const isMobile = useIsMobile();
  const { open: openSidebar } = useSidebar();

  const handleCloneSuccess = () => {
    // クローン成功時の通知
    toast.success('リポジトリのクローンが完了しました', {
      description: 'エクスプローラーでファイルを確認できます',
    });
    // モーダルを閉じる
    onOpenChange(false);
    // モバイルの場合、サイドバーを開く
    if (isMobile) {
      openSidebar();
    }
    // サイドバーのエクスプローラータブを開くイベントを発火
    window.dispatchEvent(new CustomEvent('switch-sidebar-tab', {
      detail: { tab: 'explorer' }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPortal>
            {/* PC: サイドバーを含むすべてをオーバーレイするため、z-indexを高く設定 */}
            <DialogOverlay
              className={cn(
                isMobile ? 'z-50' : 'z-65' // PC: サイドバー(z-[60])より上に表示
              )}
              asChild
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/30"
              />
            </DialogOverlay>
            <DialogPrimitive.Content
              asChild
              className={cn(
                'fixed', // 固定位置
                'max-h-[calc(100vh-2rem)]',
                'rounded-lg',
                'overflow-hidden',
                'p-0',
                'shadow-lg',
                'bg-background', // 背景色
                'outline-none',
                // PC: サイドバーを含むすべてをオーバーレイ（z-indexを高く設定）
                // モバイル: ヘッダーの下に表示
                isMobile
                  ? cn(
                      'w-[calc(100%-2rem)] max-w-[425px]', // スマホ・タブレット: 画面幅から2rem引いた幅、最大425px（app-header.tsxと同様）
                      'top-[calc(3rem+1rem+0.5rem)]', // ヘッダー高さ(48px) + 上部余白(16px) + 追加余白(8px)
                      'left-[50%] translate-x-[-50%]', // 水平中央配置
                      'translate-y-0', // 垂直方向の中央配置を解除
                      'z-70' // モバイル: ヘッダー(z-50)より上
                    )
                  : cn(
                      'max-w-md w-full',
                      'top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]', // 中央配置
                      'z-70' // PC: サイドバー(z-[60])より上に表示
                    )
              )}
            >
              <motion.div
                initial={{ 
                  opacity: 0, 
                  scale: 0.9,
                  y: isMobile ? 20 : 0
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: 0
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9,
                  y: isMobile ? 20 : 0
                }}
                transition={{ 
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1] // ease-out
                }}
                style={{ 
                  transformOrigin: 'bottom center' // 下部中央から広がる
                }}
                className="flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto"
              >
                {/* アクセシビリティ用のタイトルと説明 */}
                <DialogHeader className="p-6 pb-4">
                  <DialogTitle>リポジトリを選択</DialogTitle>
                  <DialogDescription>
                    {session
                      ? 'リポジトリを選択してください'
                      : 'リポジトリを選択するにはサインインが必要です'}
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 pb-6">
                  {session ? (
                    <RepositorySelector
                      accessToken={session.accessToken as string | undefined}
                      onCloneSuccess={handleCloneSuccess}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      リポジトリを選択するにはサインインが必要です
                    </div>
                  )}
                </div>
                {/* 閉じるボタン */}
                <DialogPrimitive.Close
                  className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                >
                  <XIcon />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

