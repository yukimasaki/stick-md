import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFileCreationError, handleFileDeletionError } from './error-handler';
import { toast } from 'sonner';
import type { FileCreationError } from '@/features/repository/domain/services/file-creation-error';
import type { FileDeletionError } from '@/features/repository/domain/services/file-deletion-error';

// sonnerをモック
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('handleFileCreationError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('VALIDATION_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: FileCreationError = {
      type: 'VALIDATION_ERROR',
      message: 'Invalid file name',
    };

    handleFileCreationError(error);

    expect(toast.error).toHaveBeenCalledWith('Validation Error', {
      description: 'Invalid file name',
    });
  });

  it('FILE_ALREADY_EXISTSの場合、適切なtoastエラーを表示する', () => {
    const error: FileCreationError = {
      type: 'FILE_ALREADY_EXISTS',
      message: 'File already exists: test.md',
      filePath: 'test.md',
    };

    handleFileCreationError(error);

    expect(toast.error).toHaveBeenCalledWith('File Already Exists', {
      description: 'File already exists: test.md',
    });
  });

  it('DIRECTORY_CREATION_FAILEDの場合、適切なtoastエラーを表示する', () => {
    const error: FileCreationError = {
      type: 'DIRECTORY_CREATION_FAILED',
      message: 'Failed to create directory: src/components',
      directoryPath: 'src/components',
    };

    handleFileCreationError(error);

    expect(toast.error).toHaveBeenCalledWith('Directory Creation Failed', {
      description: 'Failed to create directory: src/components',
    });
  });

  it('FILE_CREATION_FAILEDの場合、適切なtoastエラーを表示する', () => {
    const error: FileCreationError = {
      type: 'FILE_CREATION_FAILED',
      message: 'Failed to create file: test.md',
      filePath: 'test.md',
    };

    handleFileCreationError(error);

    expect(toast.error).toHaveBeenCalledWith('File Creation Failed', {
      description: 'Failed to create file: test.md',
    });
  });

  it('REPOSITORY_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: FileCreationError = {
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not cloned',
    };

    handleFileCreationError(error);

    expect(toast.error).toHaveBeenCalledWith('Repository Not Found', {
      description: 'Repository is not cloned',
    });
  });

  it('UNKNOWN_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: FileCreationError = {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };

    handleFileCreationError(error);

    expect(toast.error).toHaveBeenCalledWith('Unknown Error', {
      description: 'An unexpected error occurred',
    });
  });
});

describe('handleFileDeletionError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('REPOSITORY_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: FileDeletionError = {
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not cloned',
    };

    handleFileDeletionError(error);

    expect(toast.error).toHaveBeenCalledWith('Repository Not Found', {
      description: 'Repository is not cloned',
    });
  });

  it('FILE_NOT_FOUNDの場合、適切なtoastエラーを表示する', () => {
    const error: FileDeletionError = {
      type: 'FILE_NOT_FOUND',
      message: 'File or directory not found: test.md',
      filePath: 'test.md',
    };

    handleFileDeletionError(error);

    expect(toast.error).toHaveBeenCalledWith('File Not Found', {
      description: 'File or directory not found: test.md',
    });
  });

  it('FILE_SYSTEM_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: FileDeletionError = {
      type: 'FILE_SYSTEM_ERROR',
      message: 'Failed to delete file: test.md',
      filePath: 'test.md',
    };

    handleFileDeletionError(error);

    expect(toast.error).toHaveBeenCalledWith('File System Error', {
      description: 'Failed to delete file: test.md',
    });
  });

  it('UNKNOWN_ERRORの場合、適切なtoastエラーを表示する', () => {
    const error: FileDeletionError = {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };

    handleFileDeletionError(error);

    expect(toast.error).toHaveBeenCalledWith('Unknown Error', {
      description: 'An unexpected error occurred',
    });
  });

  it('予期しないエラータイプの場合、デフォルトのtoastエラーを表示する', () => {
    const error = {
      type: 'UNEXPECTED_TYPE',
      message: 'Unexpected error',
    } as unknown as FileDeletionError;

    handleFileDeletionError(error);

    expect(toast.error).toHaveBeenCalledWith('Error', {
      description: 'An unexpected error occurred',
    });
  });
});

