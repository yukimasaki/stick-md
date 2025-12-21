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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unsupported File Format</DialogTitle>
          <DialogDescription>
            The file <strong>{filePath}</strong> is not supported.
            Currently, only Markdown files (.md) are supported.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleClose}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

