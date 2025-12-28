'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import * as E from 'fp-ts/Either';
import type { ReadCommitResult } from 'isomorphic-git';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';
import { getCommitHistory } from '@/features/git/application/services/git-log-service';
import { handleGitLogError } from '@/features/git/presentation/utils/error-handler';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
/**
 * コミット履歴コンポーネント
 * Presentation Layer: コミット履歴の表示
 */
export function CommitHistory() {
  const t = useTranslations();
  const repositoryState = useSyncExternalStore(
    repositoryStore.subscribe,
    repositoryStore.getSnapshot,
    repositoryStore.getSnapshot
  );

  const [commits, setCommits] = useState<ReadCommitResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string>(() => {
    // localStorageから開閉状態を復元、なければデフォルトで開く
    if (typeof window === 'undefined') return 'history';
    const saved = localStorage.getItem('sidebar-accordion-history');
    // nullでない場合（空文字列も含む）は保存された値を使用
    if (saved !== null) {
      return saved;
    }
    return 'history';
  });

  const selectedRepo = repositoryState.repositories.find(
    (r) => r.id === repositoryState.selectedRepositoryId
  );

  const loadCommits = useCallback(async () => {
    if (!selectedRepo) {
      setCommits([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await getCommitHistory(selectedRepo, 10)();
      if (E.isRight(result)) {
        setCommits(result.right);
      } else {
        handleGitLogError(result.left);
      }
    } catch (error) {
      handleGitLogError({
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    loadCommits();
  }, [loadCommits]);

  // コミット完了イベントをリッスン
  useEffect(() => {
    const handleCommitCompleted = () => {
      loadCommits();
    };

    window.addEventListener('git-commit-completed', handleCommitCompleted);
    return () => {
      window.removeEventListener('git-commit-completed', handleCommitCompleted);
    };
  }, [loadCommits]);

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

  if (commits.length === 0) {
    return (
      <div className="px-2 py-4 text-xs text-muted-foreground text-center">
        No commits
      </div>
    );
  }

  const handleValueChange = (value: string) => {
    setAccordionValue(value);
    localStorage.setItem('sidebar-accordion-history', value);
  };

  return (
    <Accordion 
      type="single" 
      collapsible 
      value={accordionValue}
      onValueChange={handleValueChange}
      className="w-full"
    >
      <AccordionItem value="history" className="border-none">
        <AccordionTrigger className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground hover:no-underline">
          History ({commits.length})
        </AccordionTrigger>
        <AccordionContent className="px-0">
          <div className="flex flex-col gap-0.5">
            {commits.map((commit) => (
              <div
                key={commit.oid}
                className="px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                {commit.commit.message.split('\n')[0]}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

