'use client';

import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { RepositorySelector } from '@/features/repository/presentation/components/repository-selector';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
  const isMobile = useIsMobile();
  const { open: openSidebar } = useSidebar();

  const handleCloneSuccess = () => {
    // クローン成功時の通知
    toast.success(t('repositoryDialog.cloneSuccess.title'), {
      description: t('repositoryDialog.cloneSuccess.description'),
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

  const handleClose = () => {
    // 単にダイアログを閉じる（通知やサイドバー操作は行わない）
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent
        open={open}
        title={t('repositoryDialog.title')}
        description={
          session
            ? t('repositoryDialog.selectPrompt')
            : t('repositoryDialog.signInRequired')
        }
      >
        <div className="px-6 pb-6">
          {session ? (
            <RepositorySelector
              accessToken={session.accessToken as string | undefined}
              onCloneSuccess={handleCloneSuccess}
              onClose={handleClose}
            />
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('repositoryDialog.signInRequired')}
            </div>
          )}
        </div>
      </AnimatedDialogContent>
    </Dialog>
  );
}

