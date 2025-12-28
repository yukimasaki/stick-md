'use client';

import { Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface FileStatusItemProps {
  filePath: string;
  onAdd?: () => void;
  onRemove?: () => void;
  onDiscard?: () => void;
  onClick?: () => void;
}

/**
 * ファイルステータスアイテムコンポーネント
 * Presentation Layer: ファイル1件の表示と操作ボタンを提供
 */
export function FileStatusItem({
  filePath,
  onAdd,
  onRemove,
  onDiscard,
  onClick,
}: FileStatusItemProps) {
  const t = useTranslations();
  const fileName = filePath.split('/').pop() || filePath;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'transition-colors',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <span className="flex-1 truncate text-sm" title={filePath}>
        {fileName}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {onAdd && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            aria-label={t('ariaLabel.addToStage')}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label={t('ariaLabel.removeFromStage')}
          >
            <Minus className="h-3 w-3" />
          </Button>
        )}
        {onDiscard && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDiscard();
            }}
            aria-label={t('ariaLabel.discardChanges')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

