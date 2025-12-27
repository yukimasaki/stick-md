'use client';

import { User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { login, logout } from '@/app/_actions/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { useIsMobile } from '@/hooks/use-mobile';
import { RepositorySelectionDialog } from '@/features/shared/presentation/components/repository-selection-dialog';
import type { Session } from 'next-auth';

interface UserMenuDialogProps {
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
 * ユーザーメニューダイアログコンポーネント（アバター + モーダル + ダイアログ）
 */
export function UserMenuDialog({ session, avatarOnly = false, buttonClassName }: UserMenuDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showRepositoryDialog, setShowRepositoryDialog] = useState(false);
  const { repositories, selectedRepositoryId } = useRepository();
  const isMobile = useIsMobile();

  const currentRepository = repositories.find((repo) => repo.id === selectedRepositoryId);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    setIsOpen(false);
    logout();
  };

  const handleRepositorySelect = () => {
    setIsOpen(false);
    setShowRepositoryDialog(true);
  };

  return (
    <>
      {session ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
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
          </DialogTrigger>
          <AnimatePresence>
            {isOpen && (
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
                    'bg-gray-100', // メニュー背景色: 薄いグレー
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
                    {/* アクセシビリティ用のタイトルと説明（視覚的に非表示） */}
                    <DialogHeader className="sr-only">
                      <DialogTitle>ユーザーメニュー</DialogTitle>
                      <DialogDescription>ユーザー設定とアカウント管理メニュー</DialogDescription>
                    </DialogHeader>

                    {/* ユーザー情報ヘッダー */}
                    <div className="p-4 border-b bg-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {session.user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={session.user.image}
                              alt={session.user.name || 'User'}
                              className="w-10 h-10 rounded-full shrink-0 border border-gray-300 p-px bg-white"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full shrink-0 border border-gray-300 p-px bg-white flex items-center justify-center">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {session.user?.email || session.user?.name || 'User'}
                            </div>
                            {session.user?.name && session.user?.email && (
                              <div className="text-xs text-muted-foreground">{session.user.name}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* メニュー項目（セクション分割） */}
                    <div className="p-4 space-y-4">
                      {/* 一般セクション */}
                      <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-muted-foreground px-1">一般</h2>
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm flex-1 min-w-0">作業中のリポジトリ</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRepositorySelect}
                              className="shrink-0"
                            >
                              {currentRepository ? (
                                <span className="truncate max-w-[120px]">{currentRepository.name}</span>
                              ) : (
                                <span>リポジトリを選択</span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* アカウントセクション */}
                      <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-muted-foreground px-1">アカウント</h2>
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm flex-1 min-w-0">このデバイスからログアウト</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsOpen(false);
                                setShowLogoutDialog(true);
                              }}
                              className="shrink-0"
                            >
                              <span>ログアウト</span>
                            </Button>
                          </div>
                        </div>
                      </div>
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
      ) : (
        <Button variant="outline" size="sm" onClick={() => login()} className="h-8">
          <User className="h-4 w-4 mr-2" />
          <span className="text-xs">ログイン</span>
        </Button>
      )}

      {/* ログアウト確認ダイアログ */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ログアウトの確認</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* リポジトリ選択ダイアログ */}
      <RepositorySelectionDialog
        open={showRepositoryDialog}
        onOpenChange={setShowRepositoryDialog}
        session={session}
      />
    </>
  );
}

