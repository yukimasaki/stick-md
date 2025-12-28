'use client';

import { useState } from 'react';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { toast } from 'sonner';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { Repository } from '@/features/repository/domain/models/repository';
import { pushChanges } from '@/features/git/application/services/git-push-service';
import { handleGitPushError } from '@/features/git/presentation/utils/error-handler';
import { useTranslations } from 'next-intl';

interface GitPushConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository: Repository | null;
  accessToken: string | undefined;
  onPushed: () => void;
}

/**
 * プッシュ確認ダイアログコンポーネント
 * Presentation Layer: プッシュ操作の確認ダイアログ
 */
export function GitPushConfirmDialog({
  open,
  onOpenChange,
  repository,
  accessToken,
  onPushed,
}: GitPushConfirmDialogProps) {
  const t = useTranslations();
  const [isPushing, setIsPushing] = useState(false);

  const handlePush = async () => {
    if (!repository || !accessToken) return;

    setIsPushing(true);

    try {
      const result = await pushChanges(repository, accessToken)();

      pipe(
        result,
        E.fold(
          (error) => {
            handleGitPushError(error, t);
            setIsPushing(false);
          },
          () => {
            toast.success(t('git.push.success.title'), {
              description: t('git.push.success.description'),
            });
            onPushed();
            onOpenChange(false);
            setIsPushing(false);
          }
        )
      );
    } catch (error) {
      handleGitPushError(
        {
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        t
      );
      setIsPushing(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent
        open={open}
        title={t('git.push.confirm.title')}
        description={t('git.push.confirm.description')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPushing}
            >
              {t('git.push.confirm.cancel')}
            </Button>
            <Button onClick={handlePush} disabled={isPushing}>
              <ArrowUp className="h-4 w-4 mr-2" />
              {isPushing ? t('git.push.confirm.pushing') : t('git.push.button')}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

