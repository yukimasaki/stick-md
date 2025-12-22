import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { commit } from '@/features/shared/infra/clients/git-client';
import { validateCommitMessage, validateStagedFiles } from '@/features/git/domain/services/git-commit-service';
import type { GitCommitError } from '@/features/git/domain/services/git-commit-error';

/**
 * リポジトリの存在を検証
 */
function validateRepository(
  repository: Repository | undefined
): E.Either<GitCommitError, Repository> {
  if (!repository) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    });
  }
  return E.right(repository);
}

/**
 * 変更をコミット
 * Application Layer: コミットのユースケースを実装
 */
export function commitChanges(
  repository: Repository | undefined,
  message: string,
  stagedFiles: string[]
): TE.TaskEither<GitCommitError, string> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      pipe(
        validateCommitMessage(message),
        E.chain(() => validateStagedFiles(stagedFiles)),
        TE.fromEither,
        TE.chain(() =>
          TE.tryCatch(
            () => commit(repo, message),
            (error): GitCommitError => {
              if (error instanceof Error) {
                return {
                  type: 'GIT_COMMIT_ERROR',
                  message: `Failed to commit: ${error.message}`,
                };
              }
              return {
                type: 'UNKNOWN_ERROR',
                message: 'An unknown error occurred while committing',
              };
            }
          )
        )
      )
    )
  );
}

