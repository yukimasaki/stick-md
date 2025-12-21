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
 * ファイルシステムエントリの型
 */
export interface FileSystemEntry {
  path: string;
  type: 'file' | 'directory';
}

/**
 * ファイルシステムエントリからファイルツリー構造を構築
 * ディレクトリとファイルを正しく区別してツリーを構築
 */
export function buildFileTree(entries: FileSystemEntry[]): FileTreeNode[] {
  const tree: FileTreeNode[] = [];
  const pathMap = new Map<string, FileTreeNode>();

  // ディレクトリを先に処理し、その後ファイルを処理する
  const directories = entries.filter(e => e.type === 'directory').sort((a, b) => a.path.localeCompare(b.path));
  const files = entries.filter(e => e.type === 'file').sort((a, b) => a.path.localeCompare(b.path));
  const sortedEntries = [...directories, ...files];

  for (const entry of sortedEntries) {
    const parts = entry.path.split('/').filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!pathMap.has(currentPath)) {
        // 現在のエントリがこのパス自体の場合、そのタイプを使用
        // そうでない場合（親ディレクトリ）、ディレクトリとして扱う
        const isCurrentEntry = currentPath === entry.path;
        const nodeType = isCurrentEntry ? entry.type : 'directory';
        
        const node: FileTreeNode = {
          path: currentPath,
          name: part,
          type: nodeType,
          children: nodeType === 'directory' ? [] : undefined,
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

  // ツリーをソート（ディレクトリを先に、その後ファイル）
  const sortTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      // ディレクトリを先に
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      // 同じタイプの場合は名前でソート
      return a.name.localeCompare(b.name);
    }).map(node => ({
      ...node,
      children: node.children ? sortTree(node.children) : undefined,
    }));
  };

  return sortTree(tree);
}

