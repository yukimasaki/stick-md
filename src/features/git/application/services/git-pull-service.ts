import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { pull } from '@/features/shared/infra/clients/git-client';
import type { GitPullError } from '@/features/git/domain/services/git-pull-error';

/**
 * ユーザー情報の型定義
 */
interface UserInfo {
  name: string;
  email: string;
}

/**
 * リポジトリの存在を検証
 */
function validateRepository(
  repository: Repository | undefined
): E.Either<GitPullError, Repository> {
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
): E.Either<GitPullError, string> {
  if (!accessToken) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Access token is not found',
    });
  }
  return E.right(accessToken);
}

/**
 * セッション情報からユーザー情報を取得
 * セッション情報がない場合はエラーを返す（再ログインが必要）
 */
function getUserInfo(
  sessionUser: { name?: string | null; email?: string | null } | undefined
): E.Either<GitPullError, UserInfo> {
  const sessionName = sessionUser?.name;
  const sessionEmail = sessionUser?.email;

  if (!sessionName || !sessionEmail) {
    return E.left({
      type: 'GIT_PULL_ERROR',
      message: 'User information is not available. Please log in again.',
    });
  }

  return E.right({
    name: sessionName,
    email: sessionEmail,
  });
}

/**
 * リモートから変更をプル
 * Application Layer: プルのユースケースを実装
 */
export function pullChanges(
  repository: Repository | undefined,
  accessToken: string | undefined,
  sessionUser?: { name?: string | null; email?: string | null }
): TE.TaskEither<GitPullError, void> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      pipe(
        validateAccessToken(accessToken),
        TE.fromEither,
        TE.chain((token) =>
          pipe(
            getUserInfo(sessionUser),
            TE.fromEither,
            TE.chain((author) =>
              TE.tryCatch(
                () => pull(repo, token, author),
                (error): GitPullError => {
                  if (error instanceof Error) {
                    return {
                      type: 'GIT_PULL_ERROR',
                      message: `Failed to pull: ${error.message}`,
                    };
                  }
                  return {
                    type: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred while pulling',
                  };
                }
              )
            )
          )
        )
      )
    )
  );
}

