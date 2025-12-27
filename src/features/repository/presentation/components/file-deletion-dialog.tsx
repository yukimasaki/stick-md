'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { Repository } from '@/features/repository/domain/models/repository';
import { deleteFileOrDirectory } from '@/features/repository/application/services/file-deletion-service';
import { handleFileDeletionError } from '@/features/repository/presentation/utils/error-handler';
import { toast } from 'sonner';
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
            handleFileDeletionError(error);
            setIsDeleting(false);
          },
          () => {
            toast.success('Deleted', {
              description: `${isDirectory ? 'Directory' : 'File'} deleted successfully: ${filePath}`
            });
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
      });
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
        title={`Delete ${isDirectory ? 'Directory' : 'File'}`}
        description={
          <>
            Are you sure you want to delete <strong>{filePath}</strong>?
            {isDirectory && (
              <span className="block mt-2 text-destructive">
                This will permanently delete the directory and all its contents.
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
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

