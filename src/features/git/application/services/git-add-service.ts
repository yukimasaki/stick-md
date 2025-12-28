import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { addFile } from '@/features/shared/infra/clients/git-client';
import type { GitAddError } from '@/features/git/domain/services/git-add-error';

/**
 * リポジトリの存在を検証
 */
function validateRepository(
  repository: Repository | undefined
): E.Either<GitAddError, Repository> {
  if (!repository) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    });
  }
  return E.right(repository);
}

/**
 * ファイルをステージングに追加
 * Application Layer: ステージング追加のユースケースを実装
 * 削除されたファイルの場合は自動的にgit.removeを使用
 */
export function addFileToStage(
  repository: Repository | undefined,
  filePath: string
): TE.TaskEither<GitAddError, void> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      TE.tryCatch(
        () => addFile(repo, filePath),
        (error): GitAddError => {
          // "Could not find" エラーは削除されたファイルをステージングしようとした場合に発生
          if (error instanceof Error && (
            error.message.includes('ENOENT') ||
            error.message.includes('Could not find') ||
            error.message.includes('could not find')
          )) {
            return {
              type: 'FILE_NOT_FOUND',
              message: `File not found: ${filePath}. The file may have been deleted.`,
              filePath,
            };
          }
          if (error instanceof Error) {
            return {
              type: 'GIT_ADD_ERROR',
              message: `Failed to add file to stage: ${error.message}`,
              filePath,
            };
          }
          return {
            type: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred while adding file to stage',
          };
        }
      )
    )
  );
}

