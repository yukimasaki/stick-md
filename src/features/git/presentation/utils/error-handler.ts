import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { GitStatusError } from '@/features/git/domain/services/git-status-error';
import type { GitAddError } from '@/features/git/domain/services/git-add-error';
import type { GitResetError } from '@/features/git/domain/services/git-reset-error';
import type { GitCheckoutError } from '@/features/git/domain/services/git-checkout-error';
import type { GitCommitError } from '@/features/git/domain/services/git-commit-error';
import type { GitLogError } from '@/features/git/domain/services/git-log-error';
import type { GitPushError } from '@/features/git/domain/services/git-push-error';
import type { GitPullError } from '@/features/git/domain/services/git-pull-error';

/**
 * Gitステータスエラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitStatusError(error: GitStatusError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message,
      });
      break;
    case 'GIT_STATUS_ERROR':
      toast.error(t('errors.git.statusError'), {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message,
      });
      break;
    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.git.unexpectedStatusError'),
      });
  }
}

/**
 * Gitステージング追加エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitAddError(error: GitAddError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message,
      });
      break;
    case 'FILE_NOT_FOUND':
      toast.error(t('errors.common.fileNotFound'), {
        description: error.message,
      });
      break;
    case 'GIT_ADD_ERROR':
      toast.error(t('errors.git.addError'), {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message,
      });
      break;
    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.git.unexpectedAddError'),
      });
  }
}

/**
 * Gitステージング削除エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitResetError(error: GitResetError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message,
      });
      break;
    case 'FILE_NOT_FOUND':
      toast.error(t('errors.common.fileNotFound'), {
        description: error.message,
      });
      break;
    case 'GIT_RESET_ERROR':
      toast.error(t('errors.git.resetError'), {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message,
      });
      break;
    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.git.unexpectedResetError'),
      });
  }
}

/**
 * Git変更破棄エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitCheckoutError(error: GitCheckoutError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message,
      });
      break;
    case 'FILE_NOT_FOUND':
      toast.error(t('errors.common.fileNotFound'), {
        description: error.message,
      });
      break;
    case 'GIT_CHECKOUT_ERROR':
      toast.error(t('errors.git.checkoutError'), {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message,
      });
      break;
    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.git.unexpectedCheckoutError'),
      });
  }
}

/**
 * Gitコミットエラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitCommitError(error: GitCommitError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message,
      });
      break;
    case 'NO_STAGED_FILES':
      toast.error(t('errors.git.noStagedFiles'), {
        description: error.message,
      });
      break;
    case 'EMPTY_COMMIT_MESSAGE':
      toast.error(t('errors.git.emptyCommitMessage'), {
        description: error.message,
      });
      break;
    case 'GIT_COMMIT_ERROR':
      toast.error(t('errors.git.commitError'), {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message,
      });
      break;
    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.git.unexpectedCommitError'),
      });
  }
}

/**
 * Gitログ取得エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitLogError(error: GitLogError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message,
      });
      break;
    case 'NO_COMMITS':
      // コミットがない場合は正常な状態なのでトーストを表示しない
      break;
    case 'GIT_LOG_ERROR':
      toast.error(t('errors.git.logError'), {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message,
      });
      break;
    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.git.unexpectedLogError'),
      });
  }
}

/**
 * Gitプッシュエラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitPushError(error: GitPushError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message,
      });
      break;
    case 'GIT_PUSH_ERROR':
      toast.error(t('errors.git.pushError'), {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message,
      });
      break;
    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.git.unexpectedPushError'),
      });
  }
}

/**
 * Gitプルエラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitPullError(error: GitPullError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message,
      });
      break;
    case 'GIT_PULL_ERROR':
      toast.error(t('errors.git.pullError'), {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message,
      });
      break;
    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.git.unexpectedPullError'),
      });
  }
}

