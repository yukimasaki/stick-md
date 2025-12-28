'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import * as E from 'fp-ts/Either';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import { getRepositoryStatus } from '@/features/git/application/services/git-status-service';
import { addFileToStage } from '@/features/git/application/services/git-add-service';
import { resetFileFromStage } from '@/features/git/application/services/git-reset-service';
import { discardFileChanges } from '@/features/git/application/services/git-checkout-service';
import { handleGitStatusError } from '@/features/git/presentation/utils/error-handler';
import { handleGitAddError } from '@/features/git/presentation/utils/error-handler';
import { handleGitResetError } from '@/features/git/presentation/utils/error-handler';
import { handleGitCheckoutError } from '@/features/git/presentation/utils/error-handler';
import { FileStatusItem } from './file-status-item';
import { readFileContent } from '@/features/editor/application/services/file-read-service';
import { handleFileReadError } from '@/features/editor/presentation/utils/error-handler';
import { pipe } from 'fp-ts/function';
import { isSupportedFileFormat } from '@/features/editor/domain/services/file-format-service';
import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * GitステータスUIコンポーネント
 * Presentation Layer: ステージ済み/未ステージファイルの一覧表示と操作
 */
export function GitStatusUI() {
  const t = useTranslations();
  const repositoryState = useSyncExternalStore(
    repositoryStore.subscribe,
    repositoryStore.getSnapshot,
    repositoryStore.getSnapshot
  );

  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [unstagedFiles, setUnstagedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string[]>(() => {
    // localStorageから開閉状態を復元、なければデフォルトで両方開く
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sidebar-accordion-git-status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['staged', 'unstaged'];
      }
    }
    return ['staged', 'unstaged'];
  });

  const selectedRepo = repositoryState.repositories.find(
    (r) => r.id === repositoryState.selectedRepositoryId
  );

  const loadStatus = useCallback(async () => {
    if (!selectedRepo) {
      setStagedFiles([]);
      setUnstagedFiles([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await getRepositoryStatus(selectedRepo)();
      if (E.isRight(result)) {
        setStagedFiles(result.right.staged);
        setUnstagedFiles(result.right.unstaged);
      } else {
        handleGitStatusError(result.left);
      }
    } catch (error) {
      handleGitStatusError({
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // コミット完了イベントをリッスン
  useEffect(() => {
    const handleStatusChanged = () => {
      loadStatus();
    };

    window.addEventListener('git-status-changed', handleStatusChanged);
    return () => {
      window.removeEventListener('git-status-changed', handleStatusChanged);
    };
  }, [loadStatus]);

  const handleAdd = async (filePath: string) => {
    if (!selectedRepo) return;

    const result = await addFileToStage(selectedRepo, filePath)();
    if (E.isRight(result)) {
      await loadStatus();
      // CommitFormに再読み込みを通知
      window.dispatchEvent(new CustomEvent('git-status-changed'));
    } else {
      handleGitAddError(result.left);
    }
  };

  const handleRemove = async (filePath: string) => {
    if (!selectedRepo) return;

    const result = await resetFileFromStage(selectedRepo, filePath)();
    if (E.isRight(result)) {
      await loadStatus();
      // CommitFormに再読み込みを通知
      window.dispatchEvent(new CustomEvent('git-status-changed'));
    } else {
      handleGitResetError(result.left);
    }
  };

  const handleDiscard = async (filePath: string) => {
    if (!selectedRepo) return;

    const result = await discardFileChanges(selectedRepo, filePath)();
    if (E.isRight(result)) {
      // 削除されたファイルが開いているタブの場合、タブを削除済み状態としてマーク
      tabStore.markTabAsDeleted(filePath, selectedRepo.id);
      
      await loadStatus();
      // CommitFormに再読み込みを通知
      window.dispatchEvent(new CustomEvent('git-status-changed'));
    } else {
      handleGitCheckoutError(result.left);
    }
  };

  const handleFileClick = async (filePath: string) => {
    if (!selectedRepo) return;

    // ファイル形式チェック
    if (!isSupportedFileFormat(filePath)) {
      return;
    }

    // ファイルを読み込んでタブを開く
    try {
      const result = await readFileContent(selectedRepo, filePath)();
      pipe(
        result,
        E.fold(
          (error) => {
            handleFileReadError(error);
          },
          (content) => {
            const fileName = filePath.split('/').pop() || filePath;
            tabStore.openTab(filePath, selectedRepo.id, fileName, content);
          }
        )
      );
    } catch (error) {
      handleFileReadError({
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  if (!selectedRepo) {
    return (
      <div className="px-2 py-4 text-xs text-muted-foreground text-center">
        {t('git.selectRepository')}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-2 py-4 text-xs text-muted-foreground text-center">
        {t('git.loading')}
      </div>
    );
  }

  if (stagedFiles.length === 0 && unstagedFiles.length === 0) {
    return null;
  }

  // 存在するセクションのみをフィルタリング（存在しないセクションは削除）
  const validAccordionValue = accordionValue.filter(v => {
    if (v === 'staged') return stagedFiles.length > 0;
    if (v === 'unstaged') return unstagedFiles.length > 0;
    return false;
  });

  const handleValueChange = (value: string[]) => {
    setAccordionValue(value);
    localStorage.setItem('sidebar-accordion-git-status', JSON.stringify(value));
  };

  return (
    <Accordion 
      type="multiple" 
      className="w-full"
      value={validAccordionValue}
      onValueChange={handleValueChange}
    >
      {/* Staged files */}
      {stagedFiles.length > 0 && (
        <AccordionItem value="staged" className="border-none">
          <AccordionTrigger className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground hover:no-underline">
            Staged files ({stagedFiles.length})
          </AccordionTrigger>
          <AccordionContent className="px-0">
            <div className="flex flex-col gap-0.5">
              {stagedFiles.map((filePath) => (
                <FileStatusItem
                  key={filePath}
                  filePath={filePath}
                  onRemove={() => handleRemove(filePath)}
                  onClick={() => handleFileClick(filePath)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Unstaged files */}
      {unstagedFiles.length > 0 && (
        <AccordionItem value="unstaged" className="border-none">
          <AccordionTrigger className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground hover:no-underline">
            Unstaged files ({unstagedFiles.length})
          </AccordionTrigger>
          <AccordionContent className="px-0">
            <div className="flex flex-col gap-0.5">
              {unstagedFiles.map((filePath) => (
                <FileStatusItem
                  key={filePath}
                  filePath={filePath}
                  onAdd={() => handleAdd(filePath)}
                  onDiscard={() => handleDiscard(filePath)}
                  onClick={() => handleFileClick(filePath)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}

