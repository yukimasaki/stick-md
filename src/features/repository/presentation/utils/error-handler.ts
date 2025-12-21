import { toast } from 'sonner';
import type { FileCreationError } from '@/features/repository/domain/services/file-creation-error';

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

