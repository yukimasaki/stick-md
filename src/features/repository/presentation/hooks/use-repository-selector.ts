'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { 
  getDisplayRepository, 
  checkRepositoryCloned,
  type RepositorySelectionState 
} from '@/features/repository/application/services/repository-selection-service';
import { cloneRepositoryUseCase } from '@/features/repository/application/services/clone-service';
import { createRepositoryUseCase } from '@/features/repository/application/services/create-repository-service';
import { getUserRepositories } from '@/app/_actions/repository';
import { useTranslations } from 'next-intl';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

/**
 * リポジトリセレクターの状態とロジック
 * Presentation Layer: shadcn/uiのSelectコンポーネント用のフック
 */
export function useRepositorySelector(
  accessToken?: string,
  onCloneSuccess?: (options?: { skipToast?: boolean }) => void,
  onClose?: () => void
) {
  const t = useTranslations();
  const { repositories, selectedRepositoryId, isLoading, actions } = useRepository();
  
  // ビジネスロジック状態
  const [pendingRepositoryId, setPendingRepositoryId] = useState<string | null>(null);
  const [isCloned, setIsCloned] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // リポジトリ選択状態
  const selectionState: RepositorySelectionState = {
    selectedRepositoryId,
    pendingRepositoryId,
  };

  // 表示用のリポジトリ
  const displayRepo = getDisplayRepository(repositories, selectionState);

  // 現在の作業リポジトリかどうかを判定
  const isCurrentRepository = displayRepo?.id === selectedRepositoryId;

  // リポジトリがクローン済みか確認
  useEffect(() => {
    const checkClonedStatus = async () => {
      const cloned = await checkRepositoryCloned(displayRepo);
      setIsCloned(cloned);
    };
    checkClonedStatus();
  }, [displayRepo]);

  // クローン完了イベントをリッスン
  useEffect(() => {
    const handleRepositoryCloned = (event: CustomEvent<{ repositoryId: string }>) => {
      if (displayRepo && event.detail.repositoryId === displayRepo.id) {
        setIsCloned(true);
      }
    };

    window.addEventListener('repository-cloned', handleRepositoryCloned as EventListener);
    return () => {
      window.removeEventListener('repository-cloned', handleRepositoryCloned as EventListener);
    };
  }, [displayRepo]);

  // リポジトリ選択
  const handleSelect = useCallback((repoId: string | undefined) => {
    if (!repoId) {
      setPendingRepositoryId(null);
      return;
    }
    // 候補リポジトリとして設定（まだ作業リポジトリには設定しない）
    setPendingRepositoryId(repoId);
  }, []);

  // クローン実行
  const handleClone = async () => {
    if (!displayRepo || !accessToken) {
      setCloneError('Repository or access token is missing');
      return;
    }

    setIsCloning(true);
    setCloneError(null);

    try {
      await cloneRepositoryUseCase(displayRepo, accessToken);
      // クローン完了後にファイルツリーを更新するためのイベントを発火
      window.dispatchEvent(new CustomEvent('repository-cloned', { 
        detail: { repositoryId: displayRepo.id } 
      }));
      // クローン完了後に状態を更新
      setIsCloned(true);
      // クローン完了後に作業リポジトリを切り替え
      actions.selectRepository(displayRepo.id);
      // 候補リポジトリをクリア（作業リポジトリに設定されたので）
      setPendingRepositoryId(null);
      // クローン成功時のコールバックを実行
      onCloneSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clone repository';
      setCloneError(errorMessage);
      console.error('Failed to clone repository:', err);
    } finally {
      setIsCloning(false);
    }
  };

  // 作業リポジトリを切り替え（クローン済みリポジトリの場合）
  const handleSwitchRepository = useCallback(() => {
    if (!displayRepo) return;
    
    // 作業リポジトリを切り替え
    actions.selectRepository(displayRepo.id);
    // 候補リポジトリをクリア（作業リポジトリに設定されたので）
    setPendingRepositoryId(null);
    // 成功時のコールバックを実行（ダイアログを閉じるなど）
    onCloneSuccess?.();
  }, [displayRepo, actions, onCloneSuccess]);

  // 閉じる（現在の作業リポジトリの場合）
  const handleClose = useCallback(() => {
    // 候補リポジトリをクリア
    setPendingRepositoryId(null);
    // ダイアログを閉じる（クローン成功時の処理は実行しない）
    onClose?.();
  }, [onClose]);

  // リポジトリ作成
  const handleCreateRepository = useCallback(async (repositoryName: string) => {
    if (!accessToken) {
      toast.error(t('repositoryNameDialog.validation.invalid'));
      return;
    }

    setIsCreating(true);

    try {
      const result = await createRepositoryUseCase(accessToken, repositoryName, false)();

      pipe(
        result,
        E.fold(
          (error) => {
            let errorMessage = '';
            switch (error.type) {
              case 'EMPTY_NAME':
              case 'INVALID_LENGTH':
              case 'INVALID_CHARACTER':
              case 'INVALID_START_OR_END':
              case 'CONSECUTIVE_DOTS':
              case 'RESERVED_NAME':
                errorMessage = t('repositoryNameDialog.validation.invalid');
                break;
              case 'GITHUB_API_ERROR':
              case 'GIT_INIT_ERROR':
              case 'USER_INFO_ERROR':
              case 'UNKNOWN_ERROR':
                errorMessage = error.message;
                break;
              default:
                errorMessage = t('repositoryNameDialog.validation.invalid');
            }
            toast.error(errorMessage);
            setIsCreating(false);
          },
          async (repository) => {
            // リポジトリリストを再取得
            try {
              const updatedRepos = await getUserRepositories();
              actions.setRepositories(updatedRepos);
              
              // 作成したリポジトリを選択状態にする
              actions.selectRepository(repository.id);
              
              // 成功メッセージを表示
              toast.success(t('repositoryNameDialog.success.title', { name: repository.name }), {
                description: t('repositoryNameDialog.success.description'),
              });

              // クローン完了後にファイルツリーを更新するためのイベントを発火
              window.dispatchEvent(new CustomEvent('repository-cloned', { 
                detail: { repositoryId: repository.id } 
              }));

              // ダイアログを閉じる
              setShowCreateDialog(false);
              setIsCreating(false);
              
              // 成功時のコールバックはonCreationCompleteで実行されるため、ここでは呼び出さない
            } catch (err) {
              console.error('Failed to refresh repository list:', err);
              // リポジトリリストの更新に失敗しても、作成したリポジトリは選択状態にする
              actions.selectRepository(repository.id);
              toast.success(t('repositoryNameDialog.success.title', { name: repository.name }), {
                description: t('repositoryNameDialog.success.description'),
              });
              setShowCreateDialog(false);
              setIsCreating(false);
              // 成功時のコールバックはonCreationCompleteで実行されるため、ここでは呼び出さない
            }
          }
        )
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('repositoryNameDialog.validation.invalid')
      );
      setIsCreating(false);
    }
  }, [accessToken, actions, onCloneSuccess, t]);

  return {
    // 状態
    repositories,
    displayRepo,
    displayRepoId: displayRepo?.id || '',
    isLoading,
    isCloned,
    isCloning,
    cloneError,
    isCurrentRepository,
    showCreateDialog,
    isCreating,
    // アクション
    handleSelect,
    handleClone,
    handleSwitchRepository,
    handleClose,
    handleCreateRepository,
    setShowCreateDialog,
  };
}
