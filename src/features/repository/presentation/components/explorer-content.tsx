'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileTree } from '@/features/repository/presentation/components/file-tree';
import { FileNameEditDialog } from '@/features/repository/presentation/components/file-name-edit-dialog';
import { FileDeletionDialog } from '@/features/repository/presentation/components/file-deletion-dialog';
import { UnsupportedFileDialog } from '@/features/editor/presentation/components/unsupported-file-dialog';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { getRepositoryFileTree } from '@/features/repository/application/services/file-tree-service';
import { FileTreeNode } from '@/features/repository/domain/models/file-tree';
import { isSupportedFileFormat } from '@/features/editor/domain/services/file-format-service';
import { readFileContent } from '@/features/editor/application/services/file-read-service';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import { handleFileReadError } from '@/features/editor/presentation/utils/error-handler';
import { useSidebar } from '@/features/shared/presentation/contexts/sidebar-context';
import { useTranslations } from 'next-intl';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import type { Session } from 'next-auth';

interface ExplorerContentProps {
  session: Session | null;
}

export function ExplorerContent({ session }: ExplorerContentProps) {
  const t = useTranslations();
  const { repositories, selectedRepositoryId } = useRepository();
  const { close: closeSidebar } = useSidebar();
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetDirectoryPath, setTargetDirectoryPath] = useState<string>('');
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);
  const [deletionTargetPath, setDeletionTargetPath] = useState<string>('');
  const [deletionTargetIsDirectory, setDeletionTargetIsDirectory] = useState(false);
  const [isUnsupportedFileDialogOpen, setIsUnsupportedFileDialogOpen] = useState(false);
  const [unsupportedFilePath, setUnsupportedFilePath] = useState<string>('');

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

  // sessionがnullのときにファイルツリーをクリア
  useEffect(() => {
    if (!session) {
      setFileTree([]);
      setSelectedPath(undefined);
    }
  }, [session]);

  // リポジトリが変わった場合、該当リポジトリのタブをクリア
  useEffect(() => {
    if (selectedRepo) {
      const tabState = tabStore.getSnapshot();
      // 他のリポジトリのタブをクリア（現在のリポジトリ以外）
      tabState.tabs.forEach(tab => {
        if (tab.repositoryId !== selectedRepo.id) {
          tabStore.clearTabsByRepository(tab.repositoryId);
        }
      });
    }
  }, [selectedRepo]);

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

  const handleFileSelect = async (path: string) => {
    if (!selectedRepo) {
      return;
    }

    setSelectedPath(path);

    // ファイル形式チェック
    if (!isSupportedFileFormat(path)) {
      setUnsupportedFilePath(path);
      setIsUnsupportedFileDialogOpen(true);
      return;
    }

    // mdファイルの場合、サイドバーを閉じる
    closeSidebar();

    // ファイルを読み込んでタブを開く
    try {
      const result = await readFileContent(selectedRepo, path)();

      pipe(
        result,
        E.fold(
          (error) => {
            handleFileReadError(error, t);
          },
          (content) => {
            // ファイル名を取得（パスから最後の部分を抽出）
            const fileName = path.split('/').pop() || path;
            
            // タブを開く（ファイル内容も保存）
            tabStore.openTab(path, selectedRepo.id, fileName, content);
          }
        )
      );
    } catch (error) {
      handleFileReadError({
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }, t);
    }
  };

  const handleFileCreate = (directoryPath: string) => {
    setTargetDirectoryPath(directoryPath);
    setIsDialogOpen(true);
  };

  const handleFileCreated = async (filePath: string) => {
    // ファイルツリーを再読み込み
    await loadFileTree();
    
    // 作成されたファイルの親ディレクトリパスを取得
    const parentDirPath = filePath.split('/').slice(0, -1).join('/');
    
    // 親ディレクトリが存在する場合、展開状態に追加
    if (parentDirPath) {
      setExpandedPaths(prev => {
        const next = new Set(prev);
        // 親ディレクトリとそのすべての親ディレクトリを展開
        const pathParts = parentDirPath.split('/');
        let currentPath = '';
        for (const part of pathParts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          next.add(currentPath);
        }
        return next;
      });
    }
    
    // 作成されたファイルを選択状態にする
    setSelectedPath(filePath);
  };
  
  const handleToggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
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
    
    // 削除されたファイルが開いているタブの場合、タブを削除済み状態としてマーク
    if (selectedRepo) {
      tabStore.markTabAsDeleted(deletionTargetPath, selectedRepo.id);
    }
    
    // ファイルツリーを再読み込み
    await loadFileTree();
  };

  return (
    <div className="flex flex-col h-full gap-2 p-2">
      {selectedRepo && (
        <div className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground shrink-0">
          {selectedRepo.name}
        </div>
      )}
      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground text-center">
          {t('explorer.loading')}
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
              expandedPaths={expandedPaths}
              onToggleExpand={handleToggleExpand}
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
          <UnsupportedFileDialog
            open={isUnsupportedFileDialogOpen}
            onOpenChange={setIsUnsupportedFileDialogOpen}
            filePath={unsupportedFilePath}
          />
        </>
      )}
    </div>
  );
}

