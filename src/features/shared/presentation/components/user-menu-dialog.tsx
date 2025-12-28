'use client';

import { User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { login, logout } from '@/app/_actions/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { RepositorySelectionDialog } from '@/features/repository/presentation/components/repository-selection-dialog';
import { useToolbarSettings } from '@/features/editor/presentation/hooks/use-toolbar-settings';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/features/i18n/presentation/hooks/use-locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Session } from 'next-auth';
import type { LocaleOption } from '@/features/i18n/domain/types';
import type { Locale } from '@/features/i18n/domain/types';

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
  const { offset: toolbarOffset, updateOffset: updateToolbarOffset } = useToolbarSettings();
  const [toolbarOffsetInput, setToolbarOffsetInput] = useState<string>(toolbarOffset.toString());
  const { locale, switchLocale, switchToAuto, isPending } = useLocale();
  const [currentLocaleOption, setCurrentLocaleOption] = useState<LocaleOption>('auto');

  // Cookieの有無を確認して現在の選択肢を設定
  useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
    
    if (cookieValue && (cookieValue === 'ja' || cookieValue === 'en')) {
      setCurrentLocaleOption(cookieValue);
    } else {
      setCurrentLocaleOption('auto');
    }
  }, [locale]);

  const currentRepository = repositories.find((repo) => repo.id === selectedRepositoryId);

  // toolbarOffsetが変更されたときにローカルステートを更新
  useEffect(() => {
    setToolbarOffsetInput(toolbarOffset.toString());
  }, [toolbarOffset]);

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
          <AnimatedDialogContent
            open={isOpen}
            title="ユーザーメニュー"
            description="ユーザー設定とアカウント管理メニュー"
            backgroundColor="bg-gray-100"
            headerClassName="sr-only"
            showCloseButton={true}
          >
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
                <div className="bg-white rounded-lg p-4 space-y-3">
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
                  <Separator />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm flex-1 min-w-0">ツールバー位置</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        min="-200"
                        max="200"
                        value={toolbarOffsetInput}
                        onChange={(e) => {
                          // 入力中は空文字列も許可
                          setToolbarOffsetInput(e.target.value);
                        }}
                        onBlur={(e) => {
                          // フォーカスが外れたときに確定
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= -200 && value <= 200) {
                            updateToolbarOffset(value);
                          } else {
                            // 無効な値の場合は元の値に戻す
                            setToolbarOffsetInput(toolbarOffset.toString());
                          }
                        }}
                        onKeyDown={(e) => {
                          // Enterキーで確定
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        className="w-20 h-8 text-base"
                      />
                      <span className="text-sm text-muted-foreground">px</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm flex-1 min-w-0">言語</span>
                    <Select
                      value={currentLocaleOption}
                      onValueChange={(value) => {
                        if (value === 'auto') {
                          switchToAuto();
                        } else {
                          switchLocale(value as Locale);
                        }
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">自動検出</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
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
          </AnimatedDialogContent>
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

