import * as E from 'fp-ts/Either';
import { Repository } from '@/features/repository/domain/models/repository';
import { deleteFile, deleteDirectory, isRepositoryCloned, getFileSystem, getRepositoryPath } from '@/features/repository/infra/clients/git-client';
import type { FileDeletionError } from '@/features/repository/domain/services/file-deletion-error';

/**
 * ファイルパスを正規化（先頭・末尾の/を削除）
 */
function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, '');
}

/**
 * ファイルまたはディレクトリを削除
 * Application Layer: ファイル削除のユースケースを実装
 * 
 * @param repository - リポジトリ
 * @param path - 削除対象のパス（ファイルまたはディレクトリ）
 * @returns Either<FileDeletionError, void>
 */
export async function deleteFileOrDirectory(
  repository: Repository,
  path: string
): Promise<E.Either<FileDeletionError, void>> {
  // リポジトリがクローンされているか確認
  const cloned = await isRepositoryCloned(repository);
  if (!cloned) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not cloned'
    });
  }

  const fs = getFileSystem();
  const repoDir = getRepositoryPath(repository);
  const normalizedPath = normalizePath(path);
  const fullPath = normalizedPath ? `${repoDir}/${normalizedPath}` : repoDir;

  try {
    // ファイルまたはディレクトリが存在するか確認
    const stat = await fs.promises.stat(fullPath);
    
    if (stat.isDirectory()) {
      // ディレクトリの場合は再帰的に削除
      try {
        await deleteDirectory(repository, normalizedPath);
        return E.right(undefined);
      } catch (error) {
        return E.left({
          type: 'FILE_SYSTEM_ERROR',
          message: `Failed to delete directory: ${path}`,
          filePath: path
        });
      }
    } else {
      // ファイルの場合は削除
      try {
        await deleteFile(repository, normalizedPath);
        return E.right(undefined);
      } catch (error) {
        return E.left({
          type: 'FILE_SYSTEM_ERROR',
          message: `Failed to delete file: ${path}`,
          filePath: path
        });
      }
    }
  } catch (error) {
    // ファイルまたはディレクトリが存在しない場合
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return E.left({
        type: 'FILE_NOT_FOUND',
        message: `File or directory not found: ${path}`,
        filePath: path
      });
    }
    
    // その他のエラー
    return E.left({
      type: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

