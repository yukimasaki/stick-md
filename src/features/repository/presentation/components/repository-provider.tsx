'use client';

import { useEffect, useRef } from 'react';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';
import { ReactNode } from 'react';
import { getUserRepositories } from '@/app/_actions/repository';

interface RepositoryProviderProps {
  children: ReactNode;
  accessToken?: string;
}

export function RepositoryProvider({ children, accessToken }: RepositoryProviderProps) {
  const hasInitializedRef = useRef(false);
  const hasFetchedReposRef = useRef(false);

  useEffect(() => {
    // ストアの初期化（LocalStorageから読み込み）
    if (!hasInitializedRef.current) {
      repositoryStore.initialize();
      hasInitializedRef.current = true;
    }
  }, []);

  // リポジトリ一覧を取得（accessTokenがある場合のみ）
  useEffect(() => {
    const fetchRepositories = async () => {
      // 既にリポジトリが取得済み、または既に取得処理を実行済みの場合はスキップ
      const snapshot = repositoryStore.getSnapshot();
      if (snapshot.repositories.length > 0 || hasFetchedReposRef.current || !accessToken) {
        return;
      }

      hasFetchedReposRef.current = true;

      try {
        repositoryStore.setLoading(true);
        const repos = await getUserRepositories();
        repositoryStore.setRepositories(repos);
      } catch (err) {
        console.error('Failed to fetch repositories:', err);
        hasFetchedReposRef.current = false; // エラー時は再試行可能にする
      } finally {
        repositoryStore.setLoading(false);
      }
    };

    fetchRepositories();
  }, [accessToken]);

  return <>{children}</>;
}

