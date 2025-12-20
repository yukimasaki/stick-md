import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import LightningFS from '@isomorphic-git/lightning-fs';
import { Repository } from '@/features/repository/domain/models/repository';

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
 * リポジトリのファイルツリーを取得
 * Infrastructure Layer: isomorphic-gitを使用したファイル一覧取得
 */
export async function getRepositoryTree(
  repository: Repository
): Promise<string[]> {
  const fs = getFileSystem();
  const dir = getRepositoryPath(repository);

  try {
    const files = await git.listFiles({ fs, dir });
    return files;
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

