'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Markdown File</DialogTitle>
          <DialogDescription>
            Enter the file name. You can include a directory path (e.g., &quot;dir/file.md&quot;).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
        <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}

