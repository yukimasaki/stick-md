import { Repository } from '@/features/repository/domain/models/repository';
import { getRepositoryTree } from '@/features/shared/infra/clients/git-client';
import { buildFileTree, FileTreeNode } from '@/features/repository/domain/models/file-tree';

/**
 * リポジトリのファイルツリーを取得
 * Application Layer: ファイルツリー取得のユースケースを実装
 */
export async function getRepositoryFileTree(
  repository: Repository
): Promise<FileTreeNode[]> {
  const entries = await getRepositoryTree(repository);
  return buildFileTree(entries);
}

