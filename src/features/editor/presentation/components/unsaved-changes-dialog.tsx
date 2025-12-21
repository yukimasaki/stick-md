'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  fileName: string;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  fileName,
}: UnsavedChangesDialogProps) {
  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  const handleDiscard = () => {
    onDiscard();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>未保存の変更があります</DialogTitle>
          <DialogDescription>
            このファイル（{fileName}）には保存されていない変更があります。保存しますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDiscard}>
            破棄
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

