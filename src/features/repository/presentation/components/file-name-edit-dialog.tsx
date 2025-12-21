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
  const [fileName, setFileName] = useState('.md');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // モーダルが開いたときにファイル名をリセットしてフォーカス
  useEffect(() => {
    if (open) {
      setFileName('.md');
      setIsCreating(false);
      // 次のフレームでフォーカス（DOM更新を待つ）
      setTimeout(() => {
        inputRef.current?.focus();
        // ファイル名の拡張子部分を選択（.mdの前まで）
        if (inputRef.current) {
          const input = inputRef.current;
          const dotIndex = input.value.lastIndexOf('.');
          if (dotIndex > 0) {
            input.setSelectionRange(0, dotIndex);
          }
        }
      }, 0);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!repository) {
      return;
    }

    setIsCreating(true);

    try {
      const result = await createMarkdownFile(repository, directoryPath, fileName);

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
            Enter the file name. You can include a directory path (e.g., "dir/file.md").
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              ref={inputRef}
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=".md"
              disabled={isCreating}
            />
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

