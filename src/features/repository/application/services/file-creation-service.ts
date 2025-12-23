import * as E from 'fp-ts/Either';
import { Repository } from '@/features/repository/domain/models/repository';
import { createFile, ensureDirectoryExists, getRepositoryTree, isRepositoryCloned } from '@/features/shared/infra/clients/git-client';
import { validateFileName, checkFileExists } from '@/features/repository/domain/services/file-name-validation-service';
import type { FileCreationError } from '@/features/repository/domain/services/file-creation-error';

/**
 * ファイルパスを正規化（先頭・末尾の/を削除、重複する/を統一）
 */
function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
}

/**
 * ディレクトリパスとファイル名を結合
 */
function joinPath(directoryPath: string, fileName: string): string {
  const normalizedDir = normalizePath(directoryPath);
  const normalizedFile = normalizePath(fileName);
  
  if (!normalizedDir) {
    return normalizedFile;
  }
  
  return `${normalizedDir}/${normalizedFile}`;
}

/**
 * Markdownファイルを作成
 * Application Layer: ファイル作成のユースケースを実装
 * 
 * @param repository - リポジトリ
 * @param directoryPath - 作成先ディレクトリパス（空文字列の場合はルート）
 * @param fileName - ファイル名（例: "test.md" または "dir/test.md"）
 * @returns Either<FileCreationError, string> - 作成されたファイルのパス
 */
export async function createMarkdownFile(
  repository: Repository,
  directoryPath: string,
  fileName: string
): Promise<E.Either<FileCreationError, string>> {
  // リポジトリがクローンされているか確認
  const cloned = await isRepositoryCloned(repository);
  if (!cloned) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not cloned'
    });
  }

  // ファイル名のバリデーション
  const validationResult = validateFileName(fileName);
  if (E.isLeft(validationResult)) {
    return E.left({
      type: 'VALIDATION_ERROR',
      message: validationResult.left.message
    });
  }

  const validatedFileName = validationResult.right;

  // ファイル名にスラッシュが含まれる場合、ディレクトリ部分を抽出
  const fileNameParts = validatedFileName.split('/');
  const actualFileName = fileNameParts.pop()!;
  const nestedDirPath = fileNameParts.join('/');

  // 最終的なディレクトリパスを決定
  const finalDirPath = nestedDirPath
    ? joinPath(directoryPath, nestedDirPath)
    : normalizePath(directoryPath);

  // 最終的なファイルパス
  const filePath = finalDirPath ? `${finalDirPath}/${actualFileName}` : actualFileName;

  try {
    // 既存ファイルのリストを取得して重複チェック
    const existingEntries = await getRepositoryTree(repository);
    const existingFiles = existingEntries
      .filter(entry => entry.type === 'file')
      .map(entry => entry.path);

    if (checkFileExists(filePath, existingFiles)) {
      return E.left({
        type: 'FILE_ALREADY_EXISTS',
        message: `File already exists: ${filePath}`,
        filePath
      });
    }

    // ディレクトリが存在しない場合は作成
    if (finalDirPath) {
      try {
        await ensureDirectoryExists(repository, finalDirPath);
      } catch {
        return E.left({
          type: 'DIRECTORY_CREATION_FAILED',
          message: `Failed to create directory: ${finalDirPath}`,
          directoryPath: finalDirPath
        });
      }
    }

    // ファイルを作成（空のコンテンツ）
    try {
      await createFile(repository, filePath, '');
    } catch {
      return E.left({
        type: 'FILE_CREATION_FAILED',
        message: `Failed to create file: ${filePath}`,
        filePath
      });
    }

    return E.right(filePath);
  } catch (error) {
    return E.left({
      type: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

