import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { pull } from '@/features/shared/infra/clients/git-client';
import { getGitHubUser } from '@/features/repository/infra/clients/github-client';
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
 * ユーザー情報を取得（セッション情報を優先、emailが取得できない場合のみGitHub APIから取得）
 */
async function getUserInfo(
  sessionUser: { name?: string | null; email?: string | null } | undefined,
  accessToken: string
): Promise<UserInfo> {
  // セッション情報からnameとemailを取得
  const sessionName = sessionUser?.name;
  const sessionEmail = sessionUser?.email;

  // emailが取得できている場合はセッション情報を使用
  if (sessionName && sessionEmail) {
    return {
      name: sessionName,
      email: sessionEmail,
    };
  }

  // emailが取得できない場合はGitHub APIから取得
  const githubUser = await getGitHubUser(accessToken);
  return {
    name: sessionName || githubUser.name,
    email: sessionEmail || githubUser.email,
  };
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
          // セッション情報を優先してユーザー情報を取得
          TE.tryCatch(
            () => getUserInfo(sessionUser, token),
            (error): GitPullError => {
              if (error instanceof Error) {
                return {
                  type: 'GIT_PULL_ERROR',
                  message: `Failed to get user info: ${error.message}`,
                };
              }
              return {
                type: 'UNKNOWN_ERROR',
                message: 'An unknown error occurred while getting user info',
              };
            }
          )
        ),
        TE.chain((author) =>
          TE.tryCatch(
            () => pull(repo, accessToken!, author),
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
  );
}

