'use client';

import { Download } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRepositorySelector } from '@/features/repository/presentation/hooks/use-repository-selector';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface RepositorySelectorProps {
  accessToken?: string;
  onCloneSuccess?: () => void;
  onClose?: () => void;
}

export function RepositorySelector({ accessToken, onCloneSuccess, onClose }: RepositorySelectorProps) {
  const t = useTranslations();
  const {
    repositories,
    displayRepo,
    displayRepoId,
    isLoading,
    isCloned,
    isCloning,
    cloneError,
    isCurrentRepository,
    handleSelect,
    handleClone,
    handleSwitchRepository,
    handleClose,
  } = useRepositorySelector(accessToken, onCloneSuccess, onClose);

  return (
    <div className="w-full px-2">
      {/* Selectコンポーネント */}
      <Select
        value={displayRepoId}
        onValueChange={handleSelect}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('repositorySelector.placeholder')} />
        </SelectTrigger>
        <SelectPrimitive.Portal container={document.body}>
          <SelectPrimitive.Content
            data-slot="select-content"
            className={cn(
              "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-100 max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
            )}
            position="popper"
            align="start"
          >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
              className={cn(
                "p-1",
                "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1"
              )}
            >
              {isLoading ? (
                <div className="p-2 text-sm text-center text-muted-foreground">
                  {t('repositorySelector.loading')}
                </div>
              ) : repositories.length === 0 ? (
                <div className="p-2 text-sm text-center text-muted-foreground">
                  {t('repositorySelector.noRepositories')}
                </div>
              ) : (
                repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.full_name}
                  </SelectItem>
                ))
              )}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </Select>
      
      {/* Clone Button or Switch Repository Button or Close Button */}
      {displayRepo && (
        <div className="mt-3 px-2">
          {isCloned ? (
            isCurrentRepository ? (
              <Button
                onClick={handleClose}
                className="w-full"
                size="sm"
              >
                {t('repositorySelector.close')}
              </Button>
            ) : (
              <Button
                onClick={handleSwitchRepository}
                className="w-full"
                size="sm"
              >
                {t('repositorySelector.switchRepository')}
              </Button>
            )
          ) : (
            <Button
              onClick={handleClone}
              disabled={isCloning || !accessToken}
              className="w-full"
              size="sm"
            >
              {isCloning ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-spin" />
                {t('repositorySelector.cloning')}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {t('repositorySelector.clone')}
                </>
              )}
            </Button>
          )}
          {cloneError && (
            <div className="mt-2 text-xs text-destructive text-center">
              {cloneError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
