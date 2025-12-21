'use client';

import { useState } from 'react';
import { FileTreeNode } from '@/features/repository/domain/models/file-tree';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown, FilePlus } from 'lucide-react';
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
}

function FileTreeItem({
  node,
  level = 0,
  onFileSelect,
  selectedPath,
  onFileCreate,
}: {
  node: FileTreeNode;
  level?: number;
  onFileSelect?: (path: string) => void;
  selectedPath?: string;
  onFileCreate?: (directoryPath: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false); // デフォルトで閉じた状態

  const isSelected = selectedPath === node.path;
  const hasChildren = node.children && node.children.length > 0;
  const isDirectory = node.type === 'directory';

  const handleClick = () => {
    if (isDirectory && hasChildren) {
      setIsOpen(!isOpen);
    } else if (!isDirectory && onFileSelect) {
      onFileSelect(node.path);
    }
  };

  const handleCreateFile = () => {
    if (onFileCreate && isDirectory) {
      onFileCreate(node.path);
    }
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

  // ディレクトリの場合はコンテキストメニューを追加
  if (isDirectory && onFileCreate) {
    return (
      <div>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            {content}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <FilePlus className="mr-2 h-4 w-4" />
                <span>New</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={handleCreateFile}>
                  Markdown (.md)
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
        {isDirectory && hasChildren && isOpen && (
          <div>
            {node.children!.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                level={level + 1}
                onFileSelect={onFileSelect}
                selectedPath={selectedPath}
                onFileCreate={onFileCreate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ファイルの場合は通常の表示
  return (
    <div>
      {content}
    </div>
  );
}

export function FileTree({ tree, onFileSelect, selectedPath, onFileCreate }: FileTreeProps) {
  if (tree.length === 0) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div 
            className="p-4 text-sm text-muted-foreground text-center h-full"
          >
            No files available
          </div>
        </ContextMenuTrigger>
        {onFileCreate && (
          <ContextMenuContent>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <FilePlus className="mr-2 h-4 w-4" />
                <span>New</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={() => onFileCreate('')}>
                  Markdown (.md)
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        )}
      </ContextMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          className="py-2 h-full"
        >
          {tree.map((node) => (
            <FileTreeItem
              key={node.path}
              node={node}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
              onFileCreate={onFileCreate}
            />
          ))}
        </div>
      </ContextMenuTrigger>
      {onFileCreate && (
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FilePlus className="mr-2 h-4 w-4" />
              <span>New</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => onFileCreate('')}>
                Markdown (.md)
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

