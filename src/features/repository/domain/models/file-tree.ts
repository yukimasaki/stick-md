/**
 * ファイルツリーのノード
 * Domain Layer: ファイルツリー構造のドメインモデル
 */
export interface FileTreeNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

/**
 * ファイルパスからファイルツリー構造を構築
 */
export function buildFileTree(files: string[]): FileTreeNode[] {
  const tree: FileTreeNode[] = [];
  const pathMap = new Map<string, FileTreeNode>();

  // ファイルパスをソート
  const sortedFiles = [...files].sort();

  for (const filePath of sortedFiles) {
    const parts = filePath.split('/').filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!pathMap.has(currentPath)) {
        const isFile = i === parts.length - 1;
        const node: FileTreeNode = {
          path: currentPath,
          name: part,
          type: isFile ? 'file' : 'directory',
          children: isFile ? undefined : [],
        };

        pathMap.set(currentPath, node);

        if (parentPath) {
          const parent = pathMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        } else {
          tree.push(node);
        }
      }
    }
  }

  return tree;
}

