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

/**
 * GitステータスUIコンポーネント
 * Presentation Layer: ステージ済み/未ステージファイルの一覧表示と操作
 */
export function GitStatusUI() {
  const repositoryState = useSyncExternalStore(
    repositoryStore.subscribe,
    repositoryStore.getSnapshot,
    repositoryStore.getSnapshot
  );

  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [unstagedFiles, setUnstagedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        Please select a repository
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-2 py-4 text-xs text-muted-foreground text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Staged files */}
      {stagedFiles.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground">
            Staged files
          </div>
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
        </div>
      )}

      {/* Unstaged files */}
      {unstagedFiles.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground">
            Unstaged files
          </div>
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
        </div>
      )}

      {/* 変更がない場合 */}
      {stagedFiles.length === 0 && unstagedFiles.length === 0 && (
        <div className="px-2 py-4 text-xs text-muted-foreground text-center">
          No changes
        </div>
      )}
    </div>
  );
}

