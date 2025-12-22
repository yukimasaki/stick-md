import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import type { ReadCommitResult } from 'isomorphic-git';
import { Repository } from '@/features/repository/domain/models/repository';
import { getLog } from '@/features/shared/infra/clients/git-client';
import type { GitLogError } from '@/features/git/domain/services/git-log-error';

/**
 * リポジトリの存在を検証
 */
function validateRepository(
  repository: Repository | undefined
): E.Either<GitLogError, Repository> {
  if (!repository) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    });
  }
  return E.right(repository);
}

/**
 * コミット履歴を取得
 * Application Layer: コミット履歴取得のユースケースを実装
 */
export function getCommitHistory(
  repository: Repository | undefined,
  limit: number = 10
): TE.TaskEither<GitLogError, ReadCommitResult[]> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      TE.tryCatch(
        () => getLog(repo, limit),
        (error): GitLogError => {
          if (error instanceof Error) {
            return {
              type: 'GIT_LOG_ERROR',
              message: `Failed to get commit history: ${error.message}`,
            };
          }
          return {
            type: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred while getting commit history',
          };
        }
      )
    )
  );
}

