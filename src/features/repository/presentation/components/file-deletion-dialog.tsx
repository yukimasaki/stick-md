'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { Repository } from '@/features/repository/domain/models/repository';
import { deleteFileOrDirectory } from '@/features/repository/application/services/file-deletion-service';
import { handleFileDeletionError } from '@/features/repository/presentation/utils/error-handler';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

interface FileDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository: Repository | null;
  filePath: string;
  isDirectory: boolean;
  onDeleted: () => void;
}

export function FileDeletionDialog({
  open,
  onOpenChange,
  repository,
  filePath,
  isDirectory,
  onDeleted,
}: FileDeletionDialogProps) {
  const t = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!repository) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteFileOrDirectory(repository, filePath);

      pipe(
        result,
        E.fold(
          (error) => {
            handleFileDeletionError(error, t);
            setIsDeleting(false);
          },
          () => {
            const successMessage = isDirectory
              ? `${t('fileDeletionDialog.success.directory')}: ${filePath}`
              : `${t('fileDeletionDialog.success.file')}: ${filePath}`;
            toast.success(successMessage);
            onDeleted();
            onOpenChange(false);
            setIsDeleting(false);
          }
        )
      );
    } catch (error) {
      handleFileDeletionError({
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }, t);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent
        open={open}
        title={t('fileDeletionDialog.title', {
          type: isDirectory ? 'directory' : 'file'
        })}
        description={
          <>
            {t.rich('fileDeletionDialog.description', {
              filePath,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
            {isDirectory && (
              <span className="block mt-2 text-destructive">
                {t('fileDeletionDialog.directoryWarning')}
              </span>
            )}
          </>
        }
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
            >
              {t('fileDeletionDialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t('fileDeletionDialog.deleting') : t('fileDeletionDialog.delete')}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

