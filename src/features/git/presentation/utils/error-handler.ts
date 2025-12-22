import { toast } from 'sonner';
import type { GitStatusError } from '@/features/git/domain/services/git-status-error';
import type { GitAddError } from '@/features/git/domain/services/git-add-error';
import type { GitResetError } from '@/features/git/domain/services/git-reset-error';
import type { GitCheckoutError } from '@/features/git/domain/services/git-checkout-error';
import type { GitCommitError } from '@/features/git/domain/services/git-commit-error';
import type { GitLogError } from '@/features/git/domain/services/git-log-error';

/**
 * Gitステータスエラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitStatusError(error: GitStatusError): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error('Repository Not Found', {
        description: error.message,
      });
      break;
    case 'GIT_STATUS_ERROR':
      toast.error('Git Status Error', {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error('Unknown Error', {
        description: error.message,
      });
      break;
    default:
      toast.error('Error', {
        description: 'An unexpected error occurred during git status',
      });
  }
}

/**
 * Gitステージング追加エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitAddError(error: GitAddError): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error('Repository Not Found', {
        description: error.message,
      });
      break;
    case 'FILE_NOT_FOUND':
      toast.error('File Not Found', {
        description: error.message,
      });
      break;
    case 'GIT_ADD_ERROR':
      toast.error('Git Add Error', {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error('Unknown Error', {
        description: error.message,
      });
      break;
    default:
      toast.error('Error', {
        description: 'An unexpected error occurred during git add',
      });
  }
}

/**
 * Gitステージング削除エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitResetError(error: GitResetError): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error('Repository Not Found', {
        description: error.message,
      });
      break;
    case 'FILE_NOT_FOUND':
      toast.error('File Not Found', {
        description: error.message,
      });
      break;
    case 'GIT_RESET_ERROR':
      toast.error('Git Reset Error', {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error('Unknown Error', {
        description: error.message,
      });
      break;
    default:
      toast.error('Error', {
        description: 'An unexpected error occurred during git reset',
      });
  }
}

/**
 * Git変更破棄エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitCheckoutError(error: GitCheckoutError): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error('Repository Not Found', {
        description: error.message,
      });
      break;
    case 'FILE_NOT_FOUND':
      toast.error('File Not Found', {
        description: error.message,
      });
      break;
    case 'GIT_CHECKOUT_ERROR':
      toast.error('Git Checkout Error', {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error('Unknown Error', {
        description: error.message,
      });
      break;
    default:
      toast.error('Error', {
        description: 'An unexpected error occurred during git checkout',
      });
  }
}

/**
 * Gitコミットエラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitCommitError(error: GitCommitError): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error('Repository Not Found', {
        description: error.message,
      });
      break;
    case 'NO_STAGED_FILES':
      toast.error('No Staged Files', {
        description: error.message,
      });
      break;
    case 'EMPTY_COMMIT_MESSAGE':
      toast.error('Empty Commit Message', {
        description: error.message,
      });
      break;
    case 'GIT_COMMIT_ERROR':
      toast.error('Git Commit Error', {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error('Unknown Error', {
        description: error.message,
      });
      break;
    default:
      toast.error('Error', {
        description: 'An unexpected error occurred during git commit',
      });
  }
}

/**
 * Gitログ取得エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleGitLogError(error: GitLogError): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error('Repository Not Found', {
        description: error.message,
      });
      break;
    case 'GIT_LOG_ERROR':
      toast.error('Git Log Error', {
        description: error.message,
      });
      break;
    case 'UNKNOWN_ERROR':
      toast.error('Unknown Error', {
        description: error.message,
      });
      break;
    default:
      toast.error('Error', {
        description: 'An unexpected error occurred during git log',
      });
  }
}

