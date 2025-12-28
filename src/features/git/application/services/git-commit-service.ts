import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { commit } from '@/features/shared/infra/clients/git-client';
import { validateCommitMessage, validateStagedFiles } from '@/features/git/domain/services/git-commit-service';
import type { GitCommitError } from '@/features/git/domain/services/git-commit-error';

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
 * セッション情報からユーザー情報を取得
 * セッション情報がない場合はエラーを返す（再ログインが必要）
 */
function getUserInfo(
  sessionUser: { name?: string | null; email?: string | null } | undefined
): E.Either<GitCommitError, UserInfo> {
  const sessionName = sessionUser?.name;
  const sessionEmail = sessionUser?.email;

  if (!sessionName || !sessionEmail) {
    return E.left({
      type: 'GIT_COMMIT_ERROR',
      message: 'User information is not available. Please log in again.',
    });
  }

  return E.right({
    name: sessionName,
    email: sessionEmail,
  });
}

/**
 * 変更をコミット
 * Application Layer: コミットのユースケースを実装
 */
export function commitChanges(
  repository: Repository | undefined,
  message: string,
  stagedFiles: string[],
  sessionUser?: { name?: string | null; email?: string | null }
): TE.TaskEither<GitCommitError, string> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      pipe(
        validateCommitMessage(message),
        E.chain(() => validateStagedFiles(stagedFiles)),
        TE.fromEither,
        TE.chain(() =>
          pipe(
            getUserInfo(sessionUser),
            TE.fromEither,
            TE.chain((author) =>
              TE.tryCatch(
                () => commit(repo, message, author),
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
      )
    )
  );
}

