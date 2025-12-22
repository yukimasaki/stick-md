import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { getStatus } from '@/features/shared/infra/clients/git-client';
import { parseGitStatus, validateRepository } from '@/features/git/domain/services/git-status-service';
import type { GitStatusError } from '@/features/git/domain/services/git-status-error';

/**
 * リポジトリのGitステータスを取得
 * Application Layer: Gitステータス取得のユースケースを実装
 */
export function getRepositoryStatus(
  repository: Repository | undefined
): TE.TaskEither<GitStatusError, { staged: string[]; unstaged: string[] }> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      TE.tryCatch(
        () => getStatus(repo),
        (error): GitStatusError => {
          if (error instanceof Error) {
            return {
              type: 'GIT_STATUS_ERROR',
              message: `Failed to get git status: ${error.message}`,
            };
          }
          return {
            type: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred while getting git status',
          };
        }
      )
    ),
    TE.chainEitherK(parseGitStatus)
  );
}

