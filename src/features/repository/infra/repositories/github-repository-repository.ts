import { RepositoryRepository } from '@/features/repository/application/repositories/repository-repository';
import { getUserRepositories as fetchUserRepositories } from '../clients/github-client';

/**
 * GitHubリポジトリリポジトリ実装
 * Infrastructure Layer: GitHub APIを使用したリポジトリ取得の実装
 */
export const createGitHubRepositoryRepository = (): RepositoryRepository => {
  return fetchUserRepositories;
};

