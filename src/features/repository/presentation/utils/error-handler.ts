import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { FileCreationError } from '@/features/repository/domain/services/file-creation-error';
import type { FileDeletionError } from '@/features/repository/domain/services/file-deletion-error';

/**
 * ファイル作成エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleFileCreationError(error: FileCreationError, t: ReturnType<typeof useTranslations>): void {
  switch (error.type) {
    case 'VALIDATION_ERROR':
      toast.error(t('errors.repository.validationError'), {
        description: error.message
      });
      break;

    case 'FILE_ALREADY_EXISTS':
      toast.error(t('errors.repository.fileAlreadyExists'), {
        description: error.message
      });
      break;

    case 'DIRECTORY_CREATION_FAILED':
      toast.error(t('errors.repository.directoryCreationFailed'), {
        description: error.message
      });
      break;

    case 'FILE_CREATION_FAILED':
      toast.error(t('errors.repository.fileCreationFailed'), {
        description: error.message
      });
      break;

    case 'REPOSITORY_NOT_FOUND':
      toast.error(t('errors.common.repositoryNotFound'), {
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
        description: t('errors.repository.unexpectedError')
      });
  }
}

/**
 * ファイル削除エラーをtoastで表示
 * Presentation Layer: エラーハンドリングのユーティリティ
 */
export function handleFileDeletionError(error: FileDeletionError, t: ReturnType<typeof useTranslations>): void {
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
        description: t('errors.repository.unexpectedError')
      });
  }
}

