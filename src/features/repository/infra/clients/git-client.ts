import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import LightningFS from '@isomorphic-git/lightning-fs';
import { Repository } from '@/features/repository/domain/models/repository';
import type { FileSystemEntry } from '@/features/repository/domain/models/file-tree';

/**
 * LightningFSインスタンスを管理
 * Infrastructure Layer: ブラウザ内仮想ファイルシステムの管理
 */
let fsInstance: LightningFS | null = null;

/**
 * LightningFSインスタンスを取得または作成
 */
export function getFileSystem(): LightningFS {
  if (!fsInstance) {
    fsInstance = new LightningFS('stick-md-repos', { wipe: false });
  }
  return fsInstance;
}

/**
 * リポジトリのクローン先ディレクトリパスを生成
 */
export function getRepositoryPath(repository: Repository): string {
  return `/repos/${repository.full_name}`;
}

/**
 * GitHubリポジトリをクローン
 * Infrastructure Layer: isomorphic-gitを使用したGit操作
 */
export async function cloneRepository(
  repository: Repository,
  accessToken: string
): Promise<void> {
  const fs = getFileSystem();
  const dir = getRepositoryPath(repository);
  const url = `https://github.com/${repository.full_name}.git`;

  await git.clone({
    fs,
    http,
    dir,
    url,
    corsProxy: 'https://cors.isomorphic-git.org',
    singleBranch: true,
    depth: 1,
    onAuth: () => ({
      username: accessToken,
      password: '',
    }),
    onProgress: (progress) => {
      // プログレス情報をログに出力（必要に応じてUIに反映可能）
      if (progress.phase === 'indexing') {
        console.log(`Indexing: ${progress.loaded}/${progress.total}`);
      }
    },
  });
}

/**
 * リポジトリのファイルツリーを取得（ファイルとディレクトリを区別）
 * Infrastructure Layer: ファイルシステムを直接走査してファイルとディレクトリを区別
 */
export async function getRepositoryTree(
  repository: Repository
): Promise<FileSystemEntry[]> {
  const fs = getFileSystem();
  const dir = getRepositoryPath(repository);

  try {
    // ファイルシステムを直接走査してファイルとディレクトリを区別
    const walkDirectory = async (currentDir: string, basePath: string = ''): Promise<FileSystemEntry[]> => {
      const results: FileSystemEntry[] = [];
      try {
        const items = await fs.promises.readdir(currentDir);
        
        for (const item of items) {
          // .gitディレクトリは除外
          if (item === '.git') {
            continue;
          }

          const itemPath = basePath ? `${basePath}/${item}` : item;
          const fullPath = `${currentDir}/${item}`;
          
          try {
            const stat = await fs.promises.stat(fullPath);
            if (stat.isDirectory()) {
              results.push({ path: itemPath, type: 'directory' });
              // 再帰的に子ディレクトリを走査
              const children = await walkDirectory(fullPath, itemPath);
              results.push(...children);
            } else {
              results.push({ path: itemPath, type: 'file' });
            }
          } catch {
            // アクセスできない場合はスキップ
            continue;
          }
        }
      } catch {
        // ディレクトリが読めない場合は空配列を返す
      }
      
      return results;
    };

    return await walkDirectory(dir);
  } catch (error) {
    // リポジトリがクローンされていない場合
    return [];
  }
}

/**
 * リポジトリがクローン済みか確認
 */
export async function isRepositoryCloned(
  repository: Repository
): Promise<boolean> {
  const fs = getFileSystem();
  const dir = getRepositoryPath(repository);

  try {
    await fs.promises.readdir(dir);
    return true;
  } catch {
    return false;
  }
}

/**
 * ディレクトリが存在することを確認し、存在しない場合は作成
 * Infrastructure Layer: LightningFSを使用したディレクトリ作成
 */
export async function ensureDirectoryExists(
  repository: Repository,
  dirPath: string
): Promise<void> {
  const fs = getFileSystem();
  const repoDir = getRepositoryPath(repository);
  
  // パスを正規化（先頭の/を削除、末尾の/を削除）
  const normalizedPath = dirPath.replace(/^\/+|\/+$/g, '');
  const fullPath = normalizedPath ? `${repoDir}/${normalizedPath}` : repoDir;

  try {
    // ディレクトリが存在するか確認
    await fs.promises.stat(fullPath);
    // 既に存在する場合は何もしない
    return;
  } catch {
    // ディレクトリが存在しない場合、親ディレクトリを再帰的に作成
    const parts = normalizedPath.split('/').filter(Boolean);
    let currentPath = repoDir;

    for (const part of parts) {
      currentPath = `${currentPath}/${part}`;
      try {
        await fs.promises.stat(currentPath);
      } catch {
        // ディレクトリが存在しない場合は作成
        await fs.promises.mkdir(currentPath);
      }
    }
  }
}

/**
 * ファイルを作成
 * Infrastructure Layer: LightningFSを使用したファイル作成
 */
export async function createFile(
  repository: Repository,
  filePath: string,
  content: string
): Promise<void> {
  const fs = getFileSystem();
  const repoDir = getRepositoryPath(repository);
  
  // パスを正規化（先頭の/を削除）
  const normalizedPath = filePath.replace(/^\/+/, '');
  const fullPath = `${repoDir}/${normalizedPath}`;

  // 親ディレクトリを取得
  const pathParts = normalizedPath.split('/');
  const fileName = pathParts.pop();
  const dirPath = pathParts.join('/');

  // 親ディレクトリが存在することを確認（存在しない場合は作成）
  if (dirPath) {
    await ensureDirectoryExists(repository, dirPath);
  }

  // ファイルを作成
  await fs.promises.writeFile(fullPath, content, 'utf8');
}

/**
 * ファイルを削除
 * Infrastructure Layer: LightningFSを使用したファイル削除
 */
export async function deleteFile(
  repository: Repository,
  filePath: string
): Promise<void> {
  const fs = getFileSystem();
  const repoDir = getRepositoryPath(repository);
  
  // パスを正規化（先頭の/を削除）
  const normalizedPath = filePath.replace(/^\/+/, '');
  const fullPath = `${repoDir}/${normalizedPath}`;

  // ファイルを削除
  await fs.promises.unlink(fullPath);
}

/**
 * ディレクトリを再帰的に削除
 * Infrastructure Layer: LightningFSを使用したディレクトリ削除
 */
export async function deleteDirectory(
  repository: Repository,
  dirPath: string
): Promise<void> {
  const fs = getFileSystem();
  const repoDir = getRepositoryPath(repository);
  
  // パスを正規化（先頭の/を削除、末尾の/を削除）
  const normalizedPath = dirPath.replace(/^\/+|\/+$/g, '');
  const fullPath = normalizedPath ? `${repoDir}/${normalizedPath}` : repoDir;

  /**
   * ディレクトリを再帰的に削除する内部関数
   */
  const removeDirectoryRecursive = async (currentPath: string): Promise<void> => {
    try {
      const items = await fs.promises.readdir(currentPath);
      
      // ディレクトリ内の全アイテムを削除
      for (const item of items) {
        const itemPath = `${currentPath}/${item}`;
        
        try {
          const stat = await fs.promises.stat(itemPath);
          
          if (stat.isDirectory()) {
            // サブディレクトリの場合は再帰的に削除
            await removeDirectoryRecursive(itemPath);
          } else {
            // ファイルの場合は削除
            await fs.promises.unlink(itemPath);
          }
        } catch {
          // アクセスできない場合はスキップ
          continue;
        }
      }
      
      // ディレクトリ内が空になったらディレクトリ自体を削除
      await fs.promises.rmdir(currentPath);
    } catch {
      // ディレクトリが読めない、または既に削除されている場合は何もしない
    }
  };

  await removeDirectoryRecursive(fullPath);
}

