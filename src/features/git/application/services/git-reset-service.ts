import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { resetFile } from '@/features/shared/infra/clients/git-client';
import type { GitResetError } from '@/features/git/domain/services/git-reset-error';

/**
 * リポジトリの存在を検証
 */
function validateRepository(
  repository: Repository | undefined
): E.Either<GitResetError, Repository> {
  if (!repository) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    });
  }
  return E.right(repository);
}

/**
 * ファイルをステージングから削除
 * Application Layer: ステージング削除のユースケースを実装
 */
export function resetFileFromStage(
  repository: Repository | undefined,
  filePath: string
): TE.TaskEither<GitResetError, void> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      TE.tryCatch(
        () => resetFile(repo, filePath),
        (error): GitResetError => {
          if (error instanceof Error && error.message.includes('ENOENT')) {
            return {
              type: 'FILE_NOT_FOUND',
              message: `File not found: ${filePath}`,
              filePath,
            };
          }
          if (error instanceof Error) {
            return {
              type: 'GIT_RESET_ERROR',
              message: `Failed to reset file from stage: ${error.message}`,
              filePath,
            };
          }
          return {
            type: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred while resetting file from stage',
          };
        }
      )
    )
  );
}

