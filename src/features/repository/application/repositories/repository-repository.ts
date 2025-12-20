import { Repository } from '@/features/repository/domain/models/repository';

/**
 * リポジトリリポジトリ関数型
 * Application Layer: リポジトリの取得方法を抽象化
 */
export type RepositoryRepository = (
  accessToken: string
) => Promise<Repository[]>;

