'use client';

import { ReactNode } from 'react';
import { FileTreeNode } from '@/features/repository/domain/models/file-tree';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown, FilePlus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FileTreeProps {
  tree: FileTreeNode[];
  onFileSelect?: (path: string) => void;
  selectedPath?: string;
  onFileCreate?: (directoryPath: string) => void;
  onFileDelete?: (filePath: string, isDirectory: boolean) => void;
  expandedPaths?: Set<string>;
  onToggleExpand?: (path: string) => void;
}

/**
 * コンテキストメニューのz-index値
 */
const CONTEXT_MENU_Z_INDEX = 'z-75';

interface FileTreeItemProps {
  node: FileTreeNode;
  level?: number;
  onFileSelect?: (path: string) => void;
  selectedPath?: string;
  onFileCreate?: (directoryPath: string) => void;
  onFileDelete?: (filePath: string, isDirectory: boolean) => void;
  expandedPaths?: Set<string>;
  onToggleExpand?: (path: string) => void;
}

/**
 * ルートディレクトリ用のコンテキストメニューコンテンツ
 */
function RootContextMenuContent({
  onFileCreate,
}: {
  onFileCreate?: (directoryPath: string) => void;
}) {
  const t = useTranslations();

  if (!onFileCreate) {
    return null;
  }

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <FilePlus className="mr-2 h-4 w-4" />
        <span>{t('explorer.contextMenu.new')}</span>
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className={CONTEXT_MENU_Z_INDEX}>
        <ContextMenuItem onClick={() => onFileCreate('')}>
          {t('explorer.contextMenu.markdown')}
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
}

/**
 * コンテキストメニューでラップする共通コンポーネント
 */
function ContextMenuWrapper({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className={CONTEXT_MENU_Z_INDEX}>
        {content}
      </ContextMenuContent>
    </ContextMenu>
  );
}

/**
 * 子要素をレンダリングする共通関数
 */
function renderChildren(
  node: FileTreeNode,
  level: number,
  props: Omit<FileTreeItemProps, 'node' | 'level'>
) {
  if (!node.children || node.children.length === 0) {
    return null;
  }

  return (
    <div>
      {node.children.map((child) => (
        <FileTreeItem
          key={child.path}
          node={child}
          level={level + 1}
          {...props}
        />
      ))}
    </div>
  );
}

function FileTreeItem({
  node,
  level = 0,
  onFileSelect,
  selectedPath,
  onFileCreate,
  onFileDelete,
  expandedPaths,
  onToggleExpand,
}: FileTreeItemProps) {
  const t = useTranslations();
  const isSelected = selectedPath === node.path;
  const hasChildren = node.children && node.children.length > 0;
  const isDirectory = node.type === 'directory';
  const isOpen = expandedPaths?.has(node.path) ?? false;

  const itemProps: Omit<FileTreeItemProps, 'node' | 'level'> = {
    onFileSelect,
    selectedPath,
    onFileCreate,
    onFileDelete,
    expandedPaths,
    onToggleExpand,
  };

  const handleClick = () => {
    if (isDirectory && hasChildren) {
      onToggleExpand?.(node.path);
    } else if (!isDirectory && onFileSelect) {
      onFileSelect(node.path);
    }
  };

  const handleCreateFile = () => {
    if (!onFileCreate || !isDirectory) {
      return;
    }
    onFileCreate(node.path);
  };

  const handleDelete = () => {
    if (!onFileDelete) {
      return;
    }
    onFileDelete(node.path, isDirectory);
  };

  const content = (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-sm",
        "select-none",
        isSelected && "bg-accent text-accent-foreground",
        !isDirectory && "pl-6"
      )}
      style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
    >
      {isDirectory && (
        <span className="flex items-center justify-center w-4 h-4">
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </span>
      )}
      {isDirectory ? (
        isOpen ? (
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground" />
        )
      ) : (
        <File className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="truncate">{node.name}</span>
    </div>
  );

  // コンテキストメニューが必要な場合（onFileCreateまたはonFileDeleteが提供されている場合）
  const needsContextMenu = onFileCreate || onFileDelete;

  if (needsContextMenu) {
    return (
      <div>
        <ContextMenuWrapper
          content={
            <>
              {onFileCreate && isDirectory && (
                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <FilePlus className="mr-2 h-4 w-4" />
                    <span>{t('explorer.contextMenu.new')}</span>
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className={CONTEXT_MENU_Z_INDEX}>
                    <ContextMenuItem onClick={handleCreateFile}>
                      {t('explorer.contextMenu.markdown')}
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              )}
              {onFileDelete && (
                <>
                  {onFileCreate && isDirectory && <ContextMenuSeparator />}
                  <ContextMenuItem onClick={handleDelete} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{t('explorer.contextMenu.delete')}</span>
                  </ContextMenuItem>
                </>
              )}
            </>
          }
        >
          {content}
        </ContextMenuWrapper>
        {isDirectory && hasChildren && isOpen && renderChildren(node, level, itemProps)}
      </div>
    );
  }

  // コンテキストメニューが不要な場合は通常の表示
  return (
    <div>
      {content}
      {isDirectory && hasChildren && isOpen && renderChildren(node, level, itemProps)}
    </div>
  );
}

export function FileTree({ tree, onFileSelect, selectedPath, onFileCreate, onFileDelete, expandedPaths, onToggleExpand }: FileTreeProps) {
  const t = useTranslations();
  
  // コンテキストメニューが必要な場合（onFileCreateまたはonFileDeleteが提供されている場合）
  const needsContextMenu = onFileCreate || onFileDelete;

  // ツリーのコンテンツを生成
  const treeContent = tree.length === 0 ? (
    <div className="p-4 text-sm text-muted-foreground text-center h-full">
      {t('explorer.noFiles')}
    </div>
  ) : (
    <div className="py-2 h-full">
      {tree.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
          onFileCreate={onFileCreate}
          onFileDelete={onFileDelete}
          expandedPaths={expandedPaths}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </div>
  );

  // コンテキストメニューが必要な場合はラップして返す
  if (needsContextMenu) {
    return (
      <ContextMenuWrapper
        content={<RootContextMenuContent onFileCreate={onFileCreate} />}
      >
        {treeContent}
      </ContextMenuWrapper>
    );
  }

  // コンテキストメニューが不要な場合はそのまま返す
  return treeContent;
}

