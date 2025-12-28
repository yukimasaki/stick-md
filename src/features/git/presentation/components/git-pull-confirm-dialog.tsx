'use client';

import { useState } from 'react';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { toast } from 'sonner';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { Repository } from '@/features/repository/domain/models/repository';
import { pullChanges } from '@/features/git/application/services/git-pull-service';
import { handleGitPullError } from '@/features/git/presentation/utils/error-handler';
import { useTranslations } from 'next-intl';

interface GitPullConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository: Repository | null;
  accessToken: string | undefined;
  sessionUser?: { name?: string | null; email?: string | null };
  onPulled: () => void;
}

/**
 * プル確認ダイアログコンポーネント
 * Presentation Layer: プル操作の確認ダイアログ
 */
export function GitPullConfirmDialog({
  open,
  onOpenChange,
  repository,
  accessToken,
  sessionUser,
  onPulled,
}: GitPullConfirmDialogProps) {
  const t = useTranslations();
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = async () => {
    if (!repository || !accessToken) return;

    setIsPulling(true);

    try {
      const result = await pullChanges(repository, accessToken, sessionUser)();

      pipe(
        result,
        E.fold(
          (error) => {
            handleGitPullError(error, t);
            setIsPulling(false);
          },
          () => {
            toast.success(t('git.pull.success.title'), {
              description: t('git.pull.success.description'),
            });
            onPulled();
            onOpenChange(false);
            setIsPulling(false);
          }
        )
      );
    } catch (error) {
      handleGitPullError(
        {
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        t
      );
      setIsPulling(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent
        open={open}
        title={t('git.pull.confirm.title')}
        description={t('git.pull.confirm.description')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPulling}
            >
              {t('git.pull.confirm.cancel')}
            </Button>
            <Button onClick={handlePull} disabled={isPulling}>
              <ArrowDown className="h-4 w-4 mr-2" />
              {isPulling ? t('git.pull.confirm.pulling') : t('git.pull.button')}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

