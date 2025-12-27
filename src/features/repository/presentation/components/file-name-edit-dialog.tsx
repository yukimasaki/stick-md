'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Repository } from '@/features/repository/domain/models/repository';
import { createMarkdownFile } from '@/features/repository/application/services/file-creation-service';
import { handleFileCreationError } from '@/features/repository/presentation/utils/error-handler';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

interface FileNameEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository: Repository | null;
  directoryPath: string;
  onFileCreated: (filePath: string) => void;
}

export function FileNameEditDialog({
  open,
  onOpenChange,
  repository,
  directoryPath,
  onFileCreated,
}: FileNameEditDialogProps) {
  const isMobile = useIsMobile();
  const [fileName, setFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部システム（DOM）との同期: モーダルが開いたときにファイル名をリセットしてフォーカス
  useEffect(() => {
    if (!open) {
      return;
    }
    // ファイル名をリセット（DOM更新前）
    // Note: モーダルが開いたときに状態をリセットするのは、外部システム（DOM）との同期のため
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFileName('');
    setIsCreating(false);
    // 次のフレームでフォーカス（DOM更新を待つ）
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [open]);

  const handleCreate = async () => {
    if (!repository) {
      return;
    }

    setIsCreating(true);

    // ファイル名に.mdを追加
    const fileNameWithExtension = fileName.trim() ? `${fileName.trim()}.md` : '.md';

    try {
      const result = await createMarkdownFile(repository, directoryPath, fileNameWithExtension);

      pipe(
        result,
        E.fold(
          (error) => {
            handleFileCreationError(error);
            setIsCreating(false);
          },
          (filePath) => {
            onFileCreated(filePath);
            onOpenChange(false);
            setIsCreating(false);
          }
        )
      );
    } catch (error) {
      handleFileCreationError({
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
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
                  <DialogTitle>Create New Markdown File</DialogTitle>
                  <DialogDescription>
                    Enter the file name. You can include a directory path (e.g., &quot;dir/file.md&quot;).
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 pb-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        ref={inputRef}
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter file name"
                        disabled={isCreating}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">.md</span>
                    </div>
                  </div>
                </div>
                <DialogFooter className="px-6 pb-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreate}
                    disabled={isCreating || !fileName.trim()}
                  >
                    {isCreating ? 'Creating...' : 'Create'}
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

