import { Repository } from '@/features/repository/domain/models/repository';
import { cloneRepository, isRepositoryCloned } from '@/features/shared/infra/clients/git-client';

/**
 * リポジトリをクローン
 * Application Layer: クローン操作のユースケースを実装
 */
export async function cloneRepositoryUseCase(
  repository: Repository,
  accessToken: string
): Promise<void> {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  // 既にクローン済みの場合はスキップ
  const alreadyCloned = await isRepositoryCloned(repository);
  if (alreadyCloned) {
    return;
  }

  await cloneRepository(repository, accessToken);
}

