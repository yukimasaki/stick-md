import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { push } from '@/features/shared/infra/clients/git-client';
import type { GitPushError } from '@/features/git/domain/services/git-push-error';

/**
 * リポジトリの存在を検証
 */
function validateRepository(
  repository: Repository | undefined
): E.Either<GitPushError, Repository> {
  if (!repository) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    });
  }
  return E.right(repository);
}

/**
 * アクセストークンの存在を検証
 */
function validateAccessToken(
  accessToken: string | undefined
): E.Either<GitPushError, string> {
  if (!accessToken) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Access token is not found',
    });
  }
  return E.right(accessToken);
}

/**
 * 変更をリモートにプッシュ
 * Application Layer: プッシュのユースケースを実装
 * 注意: pushは既存のコミットをプッシュするだけなので、author情報は不要
 */
export function pushChanges(
  repository: Repository | undefined,
  accessToken: string | undefined
): TE.TaskEither<GitPushError, void> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      pipe(
        validateAccessToken(accessToken),
        TE.fromEither,
        TE.chain((token) =>
          TE.tryCatch(
            () => push(repo, token),
            (error): GitPushError => {
              if (error instanceof Error) {
                return {
                  type: 'GIT_PUSH_ERROR',
                  message: `Failed to push: ${error.message}`,
                };
              }
              return {
                type: 'UNKNOWN_ERROR',
                message: 'An unknown error occurred while pushing',
              };
            }
          )
        )
      )
    )
  );
}

