'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
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
        title={t('unsavedChangesDialog.title')}
        description={t('unsavedChangesDialog.description', { fileName })}
        footer={
          <>
            <Button variant="outline" onClick={handleCancel}>
              {t('unsavedChangesDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              {t('unsavedChangesDialog.discard')}
            </Button>
            <Button onClick={handleSave}>
              {t('unsavedChangesDialog.save')}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

