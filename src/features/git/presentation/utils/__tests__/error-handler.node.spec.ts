import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleGitStatusError,
  handleGitAddError,
  handleGitResetError,
  handleGitCheckoutError,
  handleGitCommitError,
  handleGitLogError,
} from '../error-handler';
import { toast } from 'sonner';
import type { GitStatusError } from '@/features/git/domain/services/git-status-error';
import type { GitAddError } from '@/features/git/domain/services/git-add-error';
import type { GitResetError } from '@/features/git/domain/services/git-reset-error';
import type { GitCheckoutError } from '@/features/git/domain/services/git-checkout-error';
import type { GitCommitError } from '@/features/git/domain/services/git-commit-error';
import type { GitLogError } from '@/features/git/domain/services/git-log-error';

// sonnerをモック
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('handleGitStatusError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('REPOSITORY_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitStatusError = {
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    };

    handleGitStatusError(error);

    expect(toast.error).toHaveBeenCalledWith('Repository Not Found', {
      description: 'Repository is not found',
    });
  });

  it('GIT_STATUS_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitStatusError = {
      type: 'GIT_STATUS_ERROR',
      message: 'Failed to get git status',
    };

    handleGitStatusError(error);

    expect(toast.error).toHaveBeenCalledWith('Git Status Error', {
      description: 'Failed to get git status',
    });
  });

  it('UNKNOWN_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitStatusError = {
      type: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };

    handleGitStatusError(error);

    expect(toast.error).toHaveBeenCalledWith('Unknown Error', {
      description: 'An unknown error occurred',
    });
  });

  it('予期しないエラータイプの場合、デフォルトのtoastエラーを表示する', () => {
    const error = {
      type: 'UNEXPECTED_TYPE',
      message: 'Unexpected error',
    } as unknown as GitStatusError;

    handleGitStatusError(error);

    expect(toast.error).toHaveBeenCalledWith('Error', {
      description: 'An unexpected error occurred during git status',
    });
  });
});

describe('handleGitAddError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('REPOSITORY_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitAddError = {
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    };

    handleGitAddError(error);

    expect(toast.error).toHaveBeenCalledWith('Repository Not Found', {
      description: 'Repository is not found',
    });
  });

  it('FILE_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitAddError = {
      type: 'FILE_NOT_FOUND',
      message: 'File not found: test.md',
      filePath: 'test.md',
    };

    handleGitAddError(error);

    expect(toast.error).toHaveBeenCalledWith('File Not Found', {
      description: 'File not found: test.md',
    });
  });

  it('GIT_ADD_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitAddError = {
      type: 'GIT_ADD_ERROR',
      message: 'Failed to add file to stage',
      filePath: 'test.md',
    };

    handleGitAddError(error);

    expect(toast.error).toHaveBeenCalledWith('Git Add Error', {
      description: 'Failed to add file to stage',
    });
  });

  it('UNKNOWN_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitAddError = {
      type: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };

    handleGitAddError(error);

    expect(toast.error).toHaveBeenCalledWith('Unknown Error', {
      description: 'An unknown error occurred',
    });
  });

  it('予期しないエラータイプの場合、デフォルトのtoastエラーを表示する', () => {
    const error = {
      type: 'UNEXPECTED_TYPE',
      message: 'Unexpected error',
    } as unknown as GitAddError;

    handleGitAddError(error);

    expect(toast.error).toHaveBeenCalledWith('Error', {
      description: 'An unexpected error occurred during git add',
    });
  });
});

describe('handleGitResetError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('REPOSITORY_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitResetError = {
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    };

    handleGitResetError(error);

    expect(toast.error).toHaveBeenCalledWith('Repository Not Found', {
      description: 'Repository is not found',
    });
  });

  it('FILE_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitResetError = {
      type: 'FILE_NOT_FOUND',
      message: 'File not found: test.md',
      filePath: 'test.md',
    };

    handleGitResetError(error);

    expect(toast.error).toHaveBeenCalledWith('File Not Found', {
      description: 'File not found: test.md',
    });
  });

  it('GIT_RESET_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitResetError = {
      type: 'GIT_RESET_ERROR',
      message: 'Failed to reset file from stage',
      filePath: 'test.md',
    };

    handleGitResetError(error);

    expect(toast.error).toHaveBeenCalledWith('Git Reset Error', {
      description: 'Failed to reset file from stage',
    });
  });

  it('UNKNOWN_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitResetError = {
      type: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };

    handleGitResetError(error);

    expect(toast.error).toHaveBeenCalledWith('Unknown Error', {
      description: 'An unknown error occurred',
    });
  });

  it('予期しないエラータイプの場合、デフォルトのtoastエラーを表示する', () => {
    const error = {
      type: 'UNEXPECTED_TYPE',
      message: 'Unexpected error',
    } as unknown as GitResetError;

    handleGitResetError(error);

    expect(toast.error).toHaveBeenCalledWith('Error', {
      description: 'An unexpected error occurred during git reset',
    });
  });
});

describe('handleGitCheckoutError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('REPOSITORY_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitCheckoutError = {
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    };

    handleGitCheckoutError(error);

    expect(toast.error).toHaveBeenCalledWith('Repository Not Found', {
      description: 'Repository is not found',
    });
  });

  it('FILE_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitCheckoutError = {
      type: 'FILE_NOT_FOUND',
      message: 'File not found: test.md',
      filePath: 'test.md',
    };

    handleGitCheckoutError(error);

    expect(toast.error).toHaveBeenCalledWith('File Not Found', {
      description: 'File not found: test.md',
    });
  });

  it('GIT_CHECKOUT_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitCheckoutError = {
      type: 'GIT_CHECKOUT_ERROR',
      message: 'Failed to checkout file',
      filePath: 'test.md',
    };

    handleGitCheckoutError(error);

    expect(toast.error).toHaveBeenCalledWith('Git Checkout Error', {
      description: 'Failed to checkout file',
    });
  });

  it('UNKNOWN_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitCheckoutError = {
      type: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };

    handleGitCheckoutError(error);

    expect(toast.error).toHaveBeenCalledWith('Unknown Error', {
      description: 'An unknown error occurred',
    });
  });

  it('予期しないエラータイプの場合、デフォルトのtoastエラーを表示する', () => {
    const error = {
      type: 'UNEXPECTED_TYPE',
      message: 'Unexpected error',
    } as unknown as GitCheckoutError;

    handleGitCheckoutError(error);

    expect(toast.error).toHaveBeenCalledWith('Error', {
      description: 'An unexpected error occurred during git checkout',
    });
  });
});

describe('handleGitCommitError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('REPOSITORY_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitCommitError = {
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    };

    handleGitCommitError(error);

    expect(toast.error).toHaveBeenCalledWith('Repository Not Found', {
      description: 'Repository is not found',
    });
  });

  it('NO_STAGED_FILESの場合、適切なtoastエラーを表示する', () => {
    const error: GitCommitError = {
      type: 'NO_STAGED_FILES',
      message: 'No staged files to commit',
    };

    handleGitCommitError(error);

    expect(toast.error).toHaveBeenCalledWith('No Staged Files', {
      description: 'No staged files to commit',
    });
  });

  it('EMPTY_COMMIT_MESSAGEの場合、適切なtoastエラーを表示する', () => {
    const error: GitCommitError = {
      type: 'EMPTY_COMMIT_MESSAGE',
      message: 'Commit message cannot be empty',
    };

    handleGitCommitError(error);

    expect(toast.error).toHaveBeenCalledWith('Empty Commit Message', {
      description: 'Commit message cannot be empty',
    });
  });

  it('GIT_COMMIT_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitCommitError = {
      type: 'GIT_COMMIT_ERROR',
      message: 'Failed to commit',
    };

    handleGitCommitError(error);

    expect(toast.error).toHaveBeenCalledWith('Git Commit Error', {
      description: 'Failed to commit',
    });
  });

  it('UNKNOWN_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitCommitError = {
      type: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };

    handleGitCommitError(error);

    expect(toast.error).toHaveBeenCalledWith('Unknown Error', {
      description: 'An unknown error occurred',
    });
  });

  it('予期しないエラータイプの場合、デフォルトのtoastエラーを表示する', () => {
    const error = {
      type: 'UNEXPECTED_TYPE',
      message: 'Unexpected error',
    } as unknown as GitCommitError;

    handleGitCommitError(error);

    expect(toast.error).toHaveBeenCalledWith('Error', {
      description: 'An unexpected error occurred during git commit',
    });
  });
});

describe('handleGitLogError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('REPOSITORY_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: GitLogError = {
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    };

    handleGitLogError(error);

    expect(toast.error).toHaveBeenCalledWith('Repository Not Found', {
      description: 'Repository is not found',
    });
  });

  it('GIT_LOG_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitLogError = {
      type: 'GIT_LOG_ERROR',
      message: 'Failed to get commit history',
    };

    handleGitLogError(error);

    expect(toast.error).toHaveBeenCalledWith('Git Log Error', {
      description: 'Failed to get commit history',
    });
  });

  it('UNKNOWN_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: GitLogError = {
      type: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };

    handleGitLogError(error);

    expect(toast.error).toHaveBeenCalledWith('Unknown Error', {
      description: 'An unknown error occurred',
    });
  });

  it('予期しないエラータイプの場合、デフォルトのtoastエラーを表示する', () => {
    const error = {
      type: 'UNEXPECTED_TYPE',
      message: 'Unexpected error',
    } as unknown as GitLogError;

    handleGitLogError(error);

    expect(toast.error).toHaveBeenCalledWith('Error', {
      description: 'An unexpected error occurred during git log',
    });
  });
});

