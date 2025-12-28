'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import * as E from 'fp-ts/Either';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';
import { commitChanges } from '@/features/git/application/services/git-commit-service';
import { getRepositoryStatus } from '@/features/git/application/services/git-status-service';
import { handleGitCommitError } from '@/features/git/presentation/utils/error-handler';
import { handleGitStatusError } from '@/features/git/presentation/utils/error-handler';
import { GitToolbar } from '@/features/git/presentation/components/git-toolbar';
import { useTranslations } from 'next-intl';
import type { Session } from 'next-auth';

interface CommitFormProps {
  session: Session | null;
}

/**
 * コミットフォームコンポーネント
 * Presentation Layer: コミットメッセージ入力とコミットボタンを提供
 */
export function CommitForm({ session }: CommitFormProps) {
  const t = useTranslations();
  const repositoryState = useSyncExternalStore(
    repositoryStore.subscribe,
    repositoryStore.getSnapshot,
    repositoryStore.getSnapshot
  );

  const [commitMessage, setCommitMessage] = useState('');
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);

  const selectedRepo = repositoryState.repositories.find(
    (r) => r.id === repositoryState.selectedRepositoryId
  );

  const loadStatus = useCallback(async () => {
    if (!selectedRepo) {
      setStagedFiles([]);
      return;
    }

    try {
      const result = await getRepositoryStatus(selectedRepo)();
      if (E.isRight(result)) {
        setStagedFiles(result.right.staged);
      } else {
        handleGitStatusError(result.left, t);
      }
    } catch (error) {
      handleGitStatusError({
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }, t);
    }
  }, [selectedRepo, t]);

  // ステージ済みファイルの状態を監視
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // GitStatusUIからのステータス変更イベントをリッスン
  useEffect(() => {
    const handleStatusChanged = () => {
      loadStatus();
    };

    window.addEventListener('git-status-changed', handleStatusChanged);
    return () => {
      window.removeEventListener('git-status-changed', handleStatusChanged);
    };
  }, [loadStatus]);

  const handleCommit = async () => {
    if (!selectedRepo || !commitMessage.trim()) return;

    setIsCommitting(true);
    try {
      const result = await commitChanges(
        selectedRepo,
        commitMessage,
        stagedFiles,
        session?.user
      )();
      if (E.isRight(result)) {
        toast.success(t('git.commit.success.title'), {
          description: t('git.commit.success.description'),
        });
        setCommitMessage('');
        await loadStatus();
        // GitStatusUIとCommitHistoryに再読み込みを通知
        window.dispatchEvent(new CustomEvent('git-status-changed'));
        window.dispatchEvent(new CustomEvent('git-commit-completed'));
      } else {
        handleGitCommitError(result.left, t);
      }
    } catch (error) {
      handleGitCommitError({
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }, t);
    } finally {
      setIsCommitting(false);
    }
  };

  const isCommitDisabled = !commitMessage.trim() || stagedFiles.length === 0 || isCommitting;

  return (
    <div className="flex flex-col gap-0">
      <GitToolbar session={session} />
      <div className="flex flex-col gap-2 p-2">
        <Textarea
          placeholder={t('git.commit.placeholder')}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <Button
          onClick={handleCommit}
          disabled={isCommitDisabled}
          className="w-full"
        >
          {isCommitting ? t('git.commit.committing') : t('git.commit.button')}
        </Button>
      </div>
    </div>
  );
}

