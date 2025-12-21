import { toast } from 'sonner';
import type { FileCreationError } from '@/features/repository/domain/services/file-creation-error';
import type { FileDeletionError } from '@/features/repository/domain/services/file-deletion-error';

/**
 * ファイル作成エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleFileCreationError(error: FileCreationError): void {
  switch (error.type) {
    case 'VALIDATION_ERROR':
      toast.error('Validation Error', {
        description: error.message
      });
      break;

    case 'FILE_ALREADY_EXISTS':
      toast.error('File Already Exists', {
        description: error.message
      });
      break;

    case 'DIRECTORY_CREATION_FAILED':
      toast.error('Directory Creation Failed', {
        description: error.message
      });
      break;

    case 'FILE_CREATION_FAILED':
      toast.error('File Creation Failed', {
        description: error.message
      });
      break;

    case 'REPOSITORY_NOT_FOUND':
      toast.error('Repository Not Found', {
        description: error.message
      });
      break;

    case 'UNKNOWN_ERROR':
      toast.error('Unknown Error', {
        description: error.message
      });
      break;

    default:
      toast.error('Error', {
        description: 'An unexpected error occurred'
      });
  }
}

/**
 * ファイル削除エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleFileDeletionError(error: FileDeletionError): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error('Repository Not Found', {
        description: error.message
      });
      break;

    case 'FILE_NOT_FOUND':
      toast.error('File Not Found', {
        description: error.message
      });
      break;

    case 'FILE_SYSTEM_ERROR':
      toast.error('File System Error', {
        description: error.message
      });
      break;

    case 'UNKNOWN_ERROR':
      toast.error('Unknown Error', {
        description: error.message
      });
      break;

    default:
      toast.error('Error', {
        description: 'An unexpected error occurred'
      });
  }
}

