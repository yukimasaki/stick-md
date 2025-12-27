'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
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
      <AnimatePresence>
        {open && (
          <DialogPortal>
            <DialogOverlay
              className={cn(
                isMobile ? 'z-50' : 'z-65'
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
                'bg-background',
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
                <DialogHeader className="p-6 pb-4">
                  <DialogTitle>Delete {isDirectory ? 'Directory' : 'File'}</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <strong>{filePath}</strong>?
                    {isDirectory && (
                      <span className="block mt-2 text-destructive">
                        This will permanently delete the directory and all its contents.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="px-6 pb-6">
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
                </DialogFooter>
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

