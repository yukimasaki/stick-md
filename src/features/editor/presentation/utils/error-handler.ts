import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { FileReadError } from '@/features/editor/domain/services/file-read-error';
import type { FileSaveError } from '@/features/editor/domain/services/file-save-error';

/**
 * ファイル読み込みエラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleFileReadError(error: FileReadError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message
      });
      break;

    case 'FILE_NOT_FOUND':
      toast.error(t('errors.common.fileNotFound'), {
        description: error.message
      });
      break;

    case 'FILE_SYSTEM_ERROR':
      toast.error(t('errors.common.fileSystemError'), {
        description: error.message
      });
      break;

    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message
      });
      break;

    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.common.unexpectedError')
      });
  }
}

/**
 * ファイル保存エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleFileSaveError(error: FileSaveError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
        description: error.message
      });
      break;

    case 'FILE_NOT_FOUND':
      toast.error(t('errors.common.fileNotFound'), {
        description: error.message
      });
      break;

    case 'NO_ACTIVE_TAB':
      toast.error(t('errors.editor.noActiveTab'), {
        description: error.message
      });
      break;

    case 'FILE_SYSTEM_ERROR':
      toast.error(t('errors.common.fileSystemError'), {
        description: error.message
      });
      break;

    case 'UNKNOWN_ERROR':
      toast.error(t('errors.common.unknownError'), {
        description: error.message
      });
      break;

    default:
      toast.error(t('errors.common.error'), {
        description: t('errors.editor.unexpectedError')
      });
  }
}

