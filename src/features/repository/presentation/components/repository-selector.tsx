'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRepositorySelector } from '@/features/repository/presentation/hooks/use-repository-selector';
import { useTranslations } from 'next-intl';

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
        <SelectContent className="z-80">
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
        </SelectContent>
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
