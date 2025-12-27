'use client';

import { XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface AnimatedDialogContentProps {
  /**
   * ダイアログが開いているかどうか
   */
  open: boolean;
  /**
   * ダイアログのコンテンツ
   */
  children?: ReactNode;
  /**
   * ダイアログのタイトル（アクセシビリティ用）
   */
  title: string;
  /**
   * ダイアログの説明（アクセシビリティ用）
   */
  description?: string | ReactNode;
  /**
   * 背景色のカスタマイズ（デフォルト: bg-background）
   */
  backgroundColor?: string;
  /**
   * ヘッダーの表示/非表示（デフォルト: true）
   */
  showHeader?: boolean;
  /**
   * 閉じるボタンの表示/非表示（デフォルト: true）
   */
  showCloseButton?: boolean;
  /**
   * ヘッダーのカスタムクラス名
   */
  headerClassName?: string;
  /**
   * フッターのカスタムコンテンツ
   */
  footer?: ReactNode;
}

/**
 * アニメーション付きダイアログコンテンツの共通ラッパー
 * Framer Motionによるアニメーションとモバイル/PCの位置調整を含む
 */
export function AnimatedDialogContent({
  open,
  children,
  title,
  description,
  backgroundColor = 'bg-background',
  showHeader = true,
  showCloseButton = true,
  headerClassName,
  footer,
}: AnimatedDialogContentProps) {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {open && (
        <DialogPortal>
          <DialogOverlay
            className={cn(
              // モバイル/PC共通: サイドバー(z-[60])より上に表示して、サイドバーも含めて暗転させる
              'z-65'
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
              'fixed',
              'max-h-[calc(100vh-2rem)]',
              'rounded-lg',
              'overflow-hidden',
              'p-0',
              'shadow-lg',
              backgroundColor,
              'outline-none',
              isMobile
                ? cn(
                    'w-[calc(100%-2rem)] max-w-[425px]',
                    'top-[calc(3rem+1rem+0.5rem)]',
                    'left-[50%] translate-x-[-50%]',
                    'translate-y-0',
                    'z-70'
                  )
                : cn(
                    'max-w-md w-full',
                    'top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
                    'z-70'
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
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{ 
                transformOrigin: 'bottom center'
              }}
              className="flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto"
            >
              {showHeader && (
                <DialogHeader className={cn('p-6 pb-4', headerClassName)}>
                  <DialogTitle>{title}</DialogTitle>
                  {description && (
                    <DialogDescription>{description}</DialogDescription>
                  )}
                </DialogHeader>
              )}
              {children}
              {footer && (
                <DialogFooter className="px-6 pb-6">
                  {footer}
                </DialogFooter>
              )}
              {showCloseButton && (
                <DialogPrimitive.Close
                  className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                >
                  <XIcon />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  );
}

