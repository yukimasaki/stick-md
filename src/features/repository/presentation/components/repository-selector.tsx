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

interface RepositorySelectorProps {
  accessToken?: string;
  onCloneSuccess?: () => void;
  onClose?: () => void;
}

export function RepositorySelector({ accessToken, onCloneSuccess, onClose }: RepositorySelectorProps) {
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
          <SelectValue placeholder="Select a repository..." />
        </SelectTrigger>
        <SelectContent className="z-80">
          {isLoading ? (
            <div className="p-2 text-sm text-center text-muted-foreground">
              Loading repositories...
            </div>
          ) : repositories.length === 0 ? (
            <div className="p-2 text-sm text-center text-muted-foreground">
              No repositories found
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
                閉じる
              </Button>
            ) : (
              <Button
                onClick={handleSwitchRepository}
                className="w-full"
                size="sm"
              >
                作業リポジトリを切り替え
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
                Cloning...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Clone
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
