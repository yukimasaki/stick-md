import { toast } from 'sonner';
import type { FileReadError } from '@/features/editor/domain/services/file-read-error';

/**
 * ファイル読み込みエラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleFileReadError(error: FileReadError): void {
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

