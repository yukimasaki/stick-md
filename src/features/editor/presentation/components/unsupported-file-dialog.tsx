'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { useTranslations } from 'next-intl';

interface UnsupportedFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string;
}

export function UnsupportedFileDialog({
  open,
  onOpenChange,
  filePath,
}: UnsupportedFileDialogProps) {
  const t = useTranslations();
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent
        open={open}
        title={t('unsupportedFileDialog.title')}
        description={
          <>
            {t.rich('unsupportedFileDialog.description', {
              filePath,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </>
        }
        footer={
          <Button type="button" onClick={handleClose}>
            {t('unsupportedFileDialog.ok')}
          </Button>
        }
      />
    </Dialog>
  );
}

