import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Repository } from '@/features/repository/domain/models/repository';
import { checkoutFile, getStatus, deleteFile } from '@/features/shared/infra/clients/git-client';
import type { GitCheckoutError } from '@/features/git/domain/services/git-checkout-error';

/**
 * リポジトリの存在を検証
 */
function validateRepository(
  repository: Repository | undefined
): E.Either<GitCheckoutError, Repository> {
  if (!repository) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    });
  }
  return E.right(repository);
}

/**
 * ファイルの変更を破棄
 * Application Layer: 変更破棄のユースケースを実装
 * 
 * 新規ファイル（未コミット）の場合はファイルシステムから削除
 * 既存ファイルの場合はgit.checkoutで変更を破棄
 */
export function discardFileChanges(
  repository: Repository | undefined,
  filePath: string
): TE.TaskEither<GitCheckoutError, void> {
  return pipe(
    TE.fromEither(validateRepository(repository)),
    TE.chain((repo) =>
      // まずファイルのステータスを取得
      TE.tryCatch(
        () => getStatus(repo),
        (error): GitCheckoutError => {
          if (error instanceof Error) {
            return {
              type: 'GIT_CHECKOUT_ERROR',
              message: `Failed to get file status: ${error.message}`,
              filePath,
            };
          }
          return {
            type: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred while getting file status',
          };
        }
      )
    ),
    TE.chain((statusMatrix) => {
      // 該当ファイルのステータスを検索
      const fileStatus = statusMatrix.find(([path]) => path === filePath);
      
      if (!fileStatus) {
        return TE.left<GitCheckoutError, void>({
          type: 'FILE_NOT_FOUND',
          message: `File not found in git status: ${filePath}`,
          filePath,
        });
      }

      const [, headStatus] = fileStatus;
      
      // headStatus === 0 の場合、新規ファイル（HEADに存在しない）なので削除
      if (headStatus === 0) {
        return TE.tryCatch(
          () => deleteFile(repository!, filePath),
          (error): GitCheckoutError => {
            if (error instanceof Error && error.message.includes('ENOENT')) {
              return {
                type: 'FILE_NOT_FOUND',
                message: `File not found: ${filePath}`,
                filePath,
              };
            }
            if (error instanceof Error) {
              return {
                type: 'GIT_CHECKOUT_ERROR',
                message: `Failed to delete file: ${error.message}`,
                filePath,
              };
            }
            return {
              type: 'UNKNOWN_ERROR',
              message: 'An unknown error occurred while deleting file',
            };
          }
        );
      }
      
      // 既存ファイルの場合はgit.checkoutで変更を破棄
      return TE.tryCatch(
        () => checkoutFile(repository!, filePath),
        (error): GitCheckoutError => {
          if (error instanceof Error && error.message.includes('ENOENT')) {
            return {
              type: 'FILE_NOT_FOUND',
              message: `File not found: ${filePath}`,
              filePath,
            };
          }
          if (error instanceof Error) {
            return {
              type: 'GIT_CHECKOUT_ERROR',
              message: `Failed to checkout file: ${error.message}`,
              filePath,
            };
          }
          return {
            type: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred while checking out file',
          };
        }
      );
    })
  );
}

