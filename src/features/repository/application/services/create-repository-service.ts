import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { validateRepositoryName, type RepositoryNameValidationError } from '@/features/repository/domain/services/repository-name-validation-service';
import { createRepository as createGitHubRepository } from '@/features/repository/infra/clients/github-client';
import { initRepository } from '@/features/shared/infra/clients/git-client';
import { getGitHubUser } from '@/features/repository/infra/clients/github-client';

/**
 * リポジトリ作成エラーの型
 */
export type CreateRepositoryError =
  | RepositoryNameValidationError
  | { type: 'GITHUB_API_ERROR'; message: string }
  | { type: 'GIT_INIT_ERROR'; message: string }
  | { type: 'USER_INFO_ERROR'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

/**
 * リポジトリ名をバリデーション
 */
function validateRepositoryNameInput(
  name: string
): E.Either<CreateRepositoryError, string> {
  return pipe(
    validateRepositoryName(name),
    E.mapLeft((error) => error as CreateRepositoryError)
  );
}

/**
 * GitHub APIでリポジトリを作成
 */
function createRepositoryOnGitHub(
  accessToken: string,
  name: string,
  isPrivate: boolean = false
): TE.TaskEither<CreateRepositoryError, Repository> {
  return TE.tryCatch(
    async () => {
      return await createGitHubRepository(accessToken, name, isPrivate);
    },
    (error): CreateRepositoryError => {
      if (error instanceof Error) {
        return {
          type: 'GITHUB_API_ERROR',
          message: `Failed to create repository on GitHub: ${error.message}`,
        };
      }
      return {
        type: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred while creating repository on GitHub',
      };
    }
  );
}

/**
 * ユーザー情報を取得
 */
function getUserInfo(
  accessToken: string
): TE.TaskEither<CreateRepositoryError, { name: string; email: string }> {
  return TE.tryCatch(
    async () => {
      return await getGitHubUser(accessToken);
    },
    (error): CreateRepositoryError => {
      if (error instanceof Error) {
        return {
          type: 'USER_INFO_ERROR',
          message: `Failed to get user info: ${error.message}`,
        };
      }
      return {
        type: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred while getting user info',
      };
    }
  );
}

/**
 * ローカルでリポジトリを初期化
 */
function initializeLocalRepository(
  repository: Repository,
  accessToken: string,
  author: { name: string; email: string }
): TE.TaskEither<CreateRepositoryError, void> {
  return TE.tryCatch(
    async () => {
      await initRepository(repository, accessToken, author);
    },
    (error): CreateRepositoryError => {
      if (error instanceof Error) {
        return {
          type: 'GIT_INIT_ERROR',
          message: `Failed to initialize repository: ${error.message}`,
        };
      }
      return {
        type: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred while initializing repository',
      };
    }
  );
}

/**
 * リポジトリを作成
 * Application Layer: リポジトリ作成のユースケースを実装
 * 
 * @param accessToken - GitHubアクセストークン
 * @param name - リポジトリ名
 * @param isPrivate - プライベートリポジトリかどうか（デフォルト: false）
 * @returns TaskEither<CreateRepositoryError, Repository> - 作成されたリポジトリ
 */
export function createRepositoryUseCase(
  accessToken: string,
  name: string,
  isPrivate: boolean = false
): TE.TaskEither<CreateRepositoryError, Repository> {
  return pipe(
    // 1. リポジトリ名のバリデーション
    TE.fromEither(validateRepositoryNameInput(name)),
    // 2. ユーザー情報を取得
    TE.chain(() => getUserInfo(accessToken)),
    // 3. GitHub APIでリポジトリを作成
    TE.chain((author) =>
      pipe(
        createRepositoryOnGitHub(accessToken, name, isPrivate),
        TE.chain((repository) =>
          // 4. ローカルでリポジトリを初期化（初期コミットとプッシュを含む）
          pipe(
            initializeLocalRepository(repository, accessToken, author),
            TE.map(() => repository)
          )
        )
      )
    )
  );
}

