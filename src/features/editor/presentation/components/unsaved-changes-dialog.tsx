'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';

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
      <AnimatedDialogContent
        open={open}
        title="未保存の変更があります"
        description={`このファイル（${fileName}）には保存されていない変更があります。保存しますか？`}
        footer={
          <>
            <Button variant="outline" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              破棄
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

