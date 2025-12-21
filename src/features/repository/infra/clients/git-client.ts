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
function getRepositoryPath(repository: Repository): string {
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

