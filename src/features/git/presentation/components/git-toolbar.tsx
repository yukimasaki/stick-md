'use client';

import { useState } from 'react';
import { useSyncExternalStore } from 'react';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import { readFileContent } from '@/features/editor/application/services/file-read-service';
import { handleFileReadError } from '@/features/editor/presentation/utils/error-handler';
import { GitPushConfirmDialog } from '@/features/git/presentation/components/git-push-confirm-dialog';
import { GitPullConfirmDialog } from '@/features/git/presentation/components/git-pull-confirm-dialog';
import { useTranslations } from 'next-intl';
import type { Session } from 'next-auth';

interface GitToolbarProps {
  session: Session | null;
}

/**
 * Gitツールバーコンポーネント
 * Presentation Layer: Push/Pullボタンを提供
 */
export function GitToolbar({ session }: GitToolbarProps) {
  const t = useTranslations();
  const repositoryState = useSyncExternalStore(
    repositoryStore.subscribe,
    repositoryStore.getSnapshot,
    repositoryStore.getSnapshot
  );

  const [showPushDialog, setShowPushDialog] = useState(false);
  const [showPullDialog, setShowPullDialog] = useState(false);

  const selectedRepo = repositoryState.repositories.find(
    (r) => r.id === repositoryState.selectedRepositoryId
  );

  const accessToken = session?.accessToken;

  const handlePushed = () => {
    // GitStatusUIとCommitHistoryに再読み込みを通知
    window.dispatchEvent(new CustomEvent('git-status-changed'));
    window.dispatchEvent(new CustomEvent('git-commit-completed'));
  };

  const handlePulled = async () => {
    if (!selectedRepo) return;
    
    // GitStatusUIとCommitHistoryに再読み込みを通知
    window.dispatchEvent(new CustomEvent('git-status-changed'));
    window.dispatchEvent(new CustomEvent('git-commit-completed'));

    // 開いているタブのファイルを最新状態に更新
    const tabState = tabStore.getSnapshot();
    const tabsToUpdate = tabState.tabs.filter(
      (tab) => tab.repositoryId === selectedRepo.id
    );

    // 各タブのファイルを再読み込み
    for (const tab of tabsToUpdate) {
      try {
        const result = await readFileContent(selectedRepo, tab.filePath)();
        pipe(
          result,
          E.fold(
            (error) => {
              // ファイルが削除された場合はエラーを無視（タブはそのまま残す）
              if (error.type !== 'FILE_NOT_FOUND') {
                handleFileReadError(error, t);
              }
            },
            (content) => {
              // タブの内容を更新（外部から読み込んだので、originalContentも更新してisDirtyをfalseにする）
              tabStore.refreshTabContent(tab.id, content);
            }
          )
        );
      } catch (error) {
        // エラーは無視して続行
        console.error(`Failed to reload file ${tab.filePath}:`, error);
      }
    }
  };

  const isDisabled = !selectedRepo || !accessToken;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-sidebar-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowPushDialog(true)}
              disabled={isDisabled}
              aria-label={t('git.push.button')}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('git.push.button')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowPullDialog(true)}
              disabled={isDisabled}
              aria-label={t('git.pull.button')}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('git.pull.button')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <GitPushConfirmDialog
        open={showPushDialog}
        onOpenChange={setShowPushDialog}
        repository={selectedRepo || null}
        accessToken={accessToken}
        onPushed={handlePushed}
      />

      <GitPullConfirmDialog
        open={showPullDialog}
        onOpenChange={setShowPullDialog}
        repository={selectedRepo || null}
        accessToken={accessToken}
        sessionUser={session?.user}
        onPulled={handlePulled}
      />
    </TooltipProvider>
  );
}

