'use client';

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';
import { saveFile } from '@/features/editor/application/services/file-save-service';
import { handleFileSaveError } from '@/features/editor/presentation/utils/error-handler';
import * as E from 'fp-ts/Either';

/**
 * 保存ボタンコンポーネント（PC/Mobile共通）
 * Presentation Layer: ファイル保存ボタンを提供
 */
export function SaveButton() {
  const tabState = useSyncExternalStore(
    tabStore.subscribe,
    tabStore.getSnapshot,
    tabStore.getSnapshot
  );

  const repositoryState = useSyncExternalStore(
    repositoryStore.subscribe,
    repositoryStore.getSnapshot,
    repositoryStore.getSnapshot
  );

  const handleSave = async () => {
    const result = await saveFile(tabState, repositoryState.repositories)();

    if (E.isLeft(result)) {
      handleFileSaveError(result.left);
    } else {
      toast.success('File saved', {
        description: 'The file has been saved successfully',
      });
      // GitステータスUIに再読み込みを通知
      window.dispatchEvent(new CustomEvent('git-status-changed'));
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={!tabState.activeTabId}
            className="h-8 w-8"
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>上書き保存</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

