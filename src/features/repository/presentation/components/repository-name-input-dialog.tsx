'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnimatedDialogContent } from '@/features/shared/presentation/components/animated-dialog-content';
import { validateRepositoryName } from '@/features/repository/domain/services/repository-name-validation-service';
import { useTranslations } from 'next-intl';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

interface RepositoryNameInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepositoryCreated: (repositoryName: string) => void;
  /**
   * リポジトリ作成中のローディング状態
   */
  isCreating?: boolean;
  /**
   * 作成完了時に親ダイアログを閉じるコールバック
   */
  onCreationComplete?: () => void;
}

export function RepositoryNameInputDialog({
  open,
  onOpenChange,
  onRepositoryCreated,
  isCreating: externalIsCreating = false,
  onCreationComplete,
}: RepositoryNameInputDialogProps) {
  const t = useTranslations();
  const [repositoryName, setRepositoryName] = useState('');
  const [localIsCreating, setLocalIsCreating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevExternalIsCreatingRef = useRef(externalIsCreating);

  // 外部から渡されたisCreating状態を監視し、完了時に親ダイアログを閉じる
  useEffect(() => {
    // 外部の作成処理が開始された
    if (externalIsCreating && !prevExternalIsCreatingRef.current) {
      // Note: 外部システム（親コンポーネントの状態）との同期のため
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalIsCreating(true);
    }
    // 外部の作成処理が完了した
    else if (!externalIsCreating && prevExternalIsCreatingRef.current) {
      // Note: 外部システム（親コンポーネントの状態）との同期のため
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalIsCreating(false);
      // 親ダイアログを閉じる
      onCreationComplete?.();
    }
    prevExternalIsCreatingRef.current = externalIsCreating;
  }, [externalIsCreating, onCreationComplete]);

  // 外部システム（DOM）との同期: モーダルが開いたときにリポジトリ名をリセットしてフォーカス
  useEffect(() => {
    if (!open) {
      return;
    }
    // リポジトリ名をリセット（DOM更新前）
    // Note: モーダルが開いたときに状態をリセットするのは、外部システム（DOM）との同期のため
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRepositoryName('');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalIsCreating(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValidationError(null);
    prevExternalIsCreatingRef.current = false;
    // 次のフレームでフォーカス（DOM更新を待つ）
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [open]);

  // リアルタイムバリデーション
  useEffect(() => {
    if (!open || !repositoryName.trim()) {
      // Note: バリデーションエラーをクリアするのは、外部システム（ユーザー入力）との同期のため
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValidationError(null);
      return;
    }

    const result = validateRepositoryName(repositoryName);
    pipe(
      result,
      E.fold(
        (error) => {
          let errorMessage = '';
          switch (error.type) {
            case 'EMPTY_NAME':
              errorMessage = t('repositoryNameDialog.validation.empty');
              break;
            case 'INVALID_LENGTH':
              errorMessage = t('repositoryNameDialog.validation.invalid');
              break;
            case 'INVALID_CHARACTER':
              errorMessage = t('repositoryNameDialog.validation.invalid');
              break;
            case 'INVALID_START_OR_END':
              errorMessage = t('repositoryNameDialog.validation.invalid');
              break;
            case 'CONSECUTIVE_DOTS':
              errorMessage = t('repositoryNameDialog.validation.invalid');
              break;
            case 'RESERVED_NAME':
              errorMessage = t('repositoryNameDialog.validation.invalid');
              break;
            default:
              errorMessage = t('repositoryNameDialog.validation.invalid');
          }
          // Note: バリデーションエラーを設定するのは、外部システム（ユーザー入力）との同期のため
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setValidationError(errorMessage);
        },
        () => {
          // Note: バリデーションエラーをクリアするのは、外部システム（ユーザー入力）との同期のため
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setValidationError(null);
        }
      )
    );
  }, [repositoryName, open, t]);

  const handleCreate = async () => {
    if (!repositoryName.trim()) {
      return;
    }

    // 最終バリデーション
    const result = validateRepositoryName(repositoryName);
    if (E.isLeft(result)) {
      setValidationError(t('repositoryNameDialog.validation.invalid'));
      return;
    }

    setLocalIsCreating(true);
    setValidationError(null);

    try {
      // リポジトリ作成処理を開始（親コンポーネントで実行される）
      onRepositoryCreated(repositoryName.trim());
      // ダイアログは親の作成処理完了後に閉じる（onCreationCompleteで処理）
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : t('repositoryNameDialog.validation.invalid')
      );
      setLocalIsCreating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!validationError && repositoryName.trim()) {
        handleCreate();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const isValid = !validationError && repositoryName.trim().length > 0;
  const isLoading = localIsCreating || externalIsCreating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent
        open={open}
        title={t('repositoryNameDialog.title')}
        description={t('repositoryNameDialog.description')}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('repositoryNameDialog.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('repositoryNameDialog.creating')}
                </>
              ) : (
                t('repositoryNameDialog.create')
              )}
            </Button>
          </>
        }
      >
        <div className="px-6 pb-4">
          <div className="grid gap-2">
            <Input
              ref={inputRef}
              value={repositoryName}
              onChange={(e) => setRepositoryName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('repositoryNameDialog.placeholder')}
              disabled={isLoading}
              className="flex-1 text-base"
              aria-invalid={validationError !== null}
            />
            {validationError && (
              <div className="text-xs text-destructive">
                {validationError}
              </div>
            )}
          </div>
        </div>
      </AnimatedDialogContent>
    </Dialog>
  );
}

