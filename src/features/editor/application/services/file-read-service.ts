import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { readFile, isRepositoryCloned } from '@/features/repository/infra/clients/git-client';
import type { FileReadError } from '@/features/editor/domain/services/file-read-error';

/**
 * ファイル内容を読み込み
 * Application Layer: ファイル読み込みのユースケースを実装
 * 
 * @param repository - リポジトリ
 * @param filePath - 読み込み対象のファイルパス
 * @returns TaskEither<FileReadError, string> - ファイル内容
 */
export function readFileContent(
  repository: Repository,
  filePath: string
): TE.TaskEither<FileReadError, string> {
  return pipe(
    // リポジトリがクローンされているか確認
    TE.fromTask(() => isRepositoryCloned(repository)),
    TE.chain((cloned) =>
      cloned
        ? TE.right(undefined)
        : TE.left<FileReadError>({
            type: 'REPOSITORY_NOT_FOUND',
            message: 'Repository is not cloned'
          })
    ),
    // ファイルを読み込み
    TE.chain(() =>
      TE.tryCatch(
        () => readFile(repository, filePath),
        (error): FileReadError => {
          if (error instanceof Error && error.message.includes('ENOENT')) {
            return {
              type: 'FILE_NOT_FOUND',
              message: `File not found: ${filePath}`,
              filePath
            };
          }
          return {
            type: 'FILE_SYSTEM_ERROR',
            message: `Failed to read file: ${filePath}`,
            filePath
          };
        }
      )
    )
  );
}

