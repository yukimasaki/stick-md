'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';

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
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent
        open={open}
        title="Unsupported File Format"
        description={
          <>
            The file <strong>{filePath}</strong> is not supported.
            Currently, only Markdown files (.md) are supported.
          </>
        }
        footer={
          <Button type="button" onClick={handleClose}>
            OK
          </Button>
        }
      />
    </Dialog>
  );
}

