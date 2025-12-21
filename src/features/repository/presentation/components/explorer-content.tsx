'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileTree } from '@/features/repository/presentation/components/file-tree';
import { FileNameEditDialog } from '@/features/repository/presentation/components/file-name-edit-dialog';
import { FileDeletionDialog } from '@/features/repository/presentation/components/file-deletion-dialog';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { getRepositoryFileTree } from '@/features/repository/application/services/file-tree-service';
import { FileTreeNode } from '@/features/repository/domain/models/file-tree';
import { cn } from '@/lib/utils';

export function ExplorerContent() {
  const { repositories, selectedRepositoryId } = useRepository();
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetDirectoryPath, setTargetDirectoryPath] = useState<string>('');
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);
  const [deletionTargetPath, setDeletionTargetPath] = useState<string>('');
  const [deletionTargetIsDirectory, setDeletionTargetIsDirectory] = useState(false);

  const selectedRepo = repositories.find(r => r.id === selectedRepositoryId) || null;

  // リポジトリが選択されたらファイルツリーを取得
  const loadFileTree = useCallback(async () => {
    if (!selectedRepo) {
      setFileTree([]);
      return;
    }

    setIsLoading(true);
    try {
      const tree = await getRepositoryFileTree(selectedRepo);
      setFileTree(tree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
      setFileTree([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  // クローン完了イベントをリッスン
  useEffect(() => {
    const handleRepositoryCloned = (event: CustomEvent<{ repositoryId: string }>) => {
      // クローンされたリポジトリが現在選択されているリポジトリと一致する場合、ファイルツリーを再読み込み
      if (selectedRepo && event.detail.repositoryId === selectedRepo.id) {
        loadFileTree();
      }
    };

    window.addEventListener('repository-cloned', handleRepositoryCloned as EventListener);
    return () => {
      window.removeEventListener('repository-cloned', handleRepositoryCloned as EventListener);
    };
  }, [selectedRepo, loadFileTree]);

  const handleFileSelect = (path: string) => {
    setSelectedPath(path);
    // TODO: ファイルを開く処理を実装
    console.log('Selected file:', path);
  };

  const handleFileCreate = (directoryPath: string) => {
    setTargetDirectoryPath(directoryPath);
    setIsDialogOpen(true);
  };

  const handleFileCreated = async (filePath: string) => {
    // ファイルツリーを再読み込み
    await loadFileTree();
    // 作成されたファイルを選択状態にする
    setSelectedPath(filePath);
  };

  const handleFileDelete = (filePath: string, isDirectory: boolean) => {
    setDeletionTargetPath(filePath);
    setDeletionTargetIsDirectory(isDirectory);
    setIsDeletionDialogOpen(true);
  };

  const handleFileDeleted = async () => {
    // 削除されたファイルが選択されている場合、選択を解除
    if (selectedPath === deletionTargetPath || selectedPath?.startsWith(`${deletionTargetPath}/`)) {
      setSelectedPath(undefined);
    }
    // ファイルツリーを再読み込み
    await loadFileTree();
  };

  return (
    <div className="flex flex-col h-full gap-2 p-2">
      <div className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground shrink-0">
        {selectedRepo ? selectedRepo.name : 'File Explorer'}
      </div>
      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground text-center">
          Loading...
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0">
            <FileTree
              tree={fileTree}
              onFileSelect={handleFileSelect}
              selectedPath={selectedPath}
              onFileCreate={selectedRepo ? handleFileCreate : undefined}
              onFileDelete={selectedRepo ? handleFileDelete : undefined}
            />
          </div>
          {selectedRepo && (
            <>
              <FileNameEditDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                repository={selectedRepo}
                directoryPath={targetDirectoryPath}
                onFileCreated={handleFileCreated}
              />
              <FileDeletionDialog
                open={isDeletionDialogOpen}
                onOpenChange={setIsDeletionDialogOpen}
                repository={selectedRepo}
                filePath={deletionTargetPath}
                isDirectory={deletionTargetIsDirectory}
                onDeleted={handleFileDeleted}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

