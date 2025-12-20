import { Repository } from '@/features/repository/domain/models/repository';
import { RepositoryRepository } from '../repositories/repository-repository';

/**
 * アクセストークンの検証
 */
function validateAccessToken(accessToken: string): void {
  if (!accessToken) {
    throw new Error('Access token is required');
  }
}

/**
 * ログインユーザーのリポジトリ一覧を取得
 * Application Layer: リポジトリ取得のユースケースを実装
 */
export async function getUserRepositories(
  repositoryRepository: RepositoryRepository,
  accessToken: string
): Promise<Repository[]> {
  validateAccessToken(accessToken);
  return repositoryRepository(accessToken);
}

