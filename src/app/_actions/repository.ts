'use server';

import { auth } from '@/auth';
import { getUserRepositories as getUserRepositoriesUseCase } from '@/features/repository/application/services/repository-service';
import { createGitHubRepositoryRepository } from '@/features/repository/infra/repositories/github-repository-repository';
import { Repository } from '@/features/repository/domain/models/repository';

/**
 * ログインユーザーのリポジトリ一覧を取得するServer Action
 * Presentation Layer: サーバー側でリポジトリ取得を実行
 */
export async function getUserRepositories(): Promise<Repository[]> {
  const session = await auth();

  if (!session?.accessToken) {
    throw new Error('User is not authenticated');
  }

  // 依存性注入: Infrastructure Layerの実装を注入
  const repositoryRepository = createGitHubRepositoryRepository();

  return getUserRepositoriesUseCase(repositoryRepository, session.accessToken);
}

