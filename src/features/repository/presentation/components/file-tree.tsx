'use client';

import { useState } from 'react';
import { FileTreeNode } from '@/features/repository/domain/models/file-tree';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  tree: FileTreeNode[];
  onFileSelect?: (path: string) => void;
  selectedPath?: string;
}

function FileTreeItem({
  node,
  level = 0,
  onFileSelect,
  selectedPath,
}: {
  node: FileTreeNode;
  level?: number;
  onFileSelect?: (path: string) => void;
  selectedPath?: string;
}) {
  const [isOpen, setIsOpen] = useState(level < 2); // 最初の2レベルは開く

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

  return (
    <div>
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
      {isDirectory && hasChildren && isOpen && (
        <div>
          {node.children!.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ tree, onFileSelect, selectedPath }: FileTreeProps) {
  if (tree.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No files available
      </div>
    );
  }

  return (
    <div className="py-2">
      {tree.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
}

