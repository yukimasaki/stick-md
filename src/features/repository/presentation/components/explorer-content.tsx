'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { FileTree } from '@/features/repository/presentation/components/file-tree';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { getRepositoryFileTree } from '@/features/repository/application/services/file-tree-service';
import { FileTreeNode } from '@/features/repository/domain/models/file-tree';

export function ExplorerContent() {
  const { repositories, selectedRepositoryId } = useRepository();
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | undefined>();

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

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {selectedRepo ? selectedRepo.name : 'File Explorer'}
      </SidebarGroupLabel>
      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground text-center">
          Loading...
        </div>
      ) : (
        <FileTree
          tree={fileTree}
          onFileSelect={handleFileSelect}
          selectedPath={selectedPath}
        />
      )}
    </SidebarGroup>
  );
}

