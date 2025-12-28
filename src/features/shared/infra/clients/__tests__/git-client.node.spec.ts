import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRepositoryPath,
  getFileSystem,
  isRepositoryCloned,
  readFile,
  createFile,
  deleteFile,
  ensureDirectoryExists,
  getCurrentBranch,
} from '../git-client';
import { Repository } from '@/features/repository/domain/models/repository';
import git from 'isomorphic-git';

/**
 * Stats型のモック
 */
interface MockStats {
  isDirectory: () => boolean;
  isFile: () => boolean;
  size: number;
  mtime: Date;
}

// LightningFSをモック
vi.mock('@isomorphic-git/lightning-fs', () => {
  return {
    default: class MockLightningFS {
      promises: {
        readdir: ReturnType<typeof vi.fn>;
        readFile: ReturnType<typeof vi.fn>;
        writeFile: ReturnType<typeof vi.fn>;
        unlink: ReturnType<typeof vi.fn>;
        stat: ReturnType<typeof vi.fn>;
        mkdir: ReturnType<typeof vi.fn>;
      };
      constructor() {
        this.promises = {
          readdir: vi.fn(),
          readFile: vi.fn(),
          writeFile: vi.fn(),
          unlink: vi.fn(),
          stat: vi.fn(),
          mkdir: vi.fn(),
        };
      }
    },
  };
});

// isomorphic-gitをモック
vi.mock('isomorphic-git', () => ({
  default: {
    currentBranch: vi.fn(),
  },
}));

describe('getRepositoryPath', () => {
  it('リポジトリのフルネームから正しいパスを生成する', () => {
    const repository: Repository = {
      id: 'repo-1',
      name: 'test-repo',
      full_name: 'user/test-repo',
      private: false,
    };

    const result = getRepositoryPath(repository);

    expect(result).toBe('/repos/user/test-repo');
  });

  it('異なるリポジトリでも正しいパスを生成する', () => {
    const repository: Repository = {
      id: 'repo-2',
      name: 'another-repo',
      full_name: 'org/another-repo',
      private: true,
    };

    const result = getRepositoryPath(repository);

    expect(result).toBe('/repos/org/another-repo');
  });

  it('スラッシュを含むリポジトリ名でも正しく処理する', () => {
    const repository: Repository = {
      id: 'repo-3',
      name: 'nested/repo',
      full_name: 'org/nested/repo',
      private: false,
    };

    const result = getRepositoryPath(repository);

    expect(result).toBe('/repos/org/nested/repo');
  });

  it('パスに使用できない文字をエスケープする', () => {
    const repository: Repository = {
      id: 'repo-4',
      name: 'test:repo',
      full_name: 'user/test:repo',
      private: false,
    };

    const result = getRepositoryPath(repository);

    expect(result).toBe('/repos/user/test_repo');
  });
});

describe('getFileSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('LightningFSインスタンスを生成する', () => {
    const fs = getFileSystem();

    // LightningFSはクラスなので、インスタンスが生成されることを確認
    expect(fs).toBeDefined();
    expect(fs.promises).toBeDefined();
    expect(fs.promises.readdir).toBeDefined();
  });

  it('既存のインスタンスを再利用する', () => {
    const fs1 = getFileSystem();
    const fs2 = getFileSystem();

    // 同じインスタンスが返されることを確認
    expect(fs1).toBe(fs2);
  });
});

describe('isRepositoryCloned', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('リポジトリがクローン済みの場合、trueを返す', async () => {
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.readdir).mockResolvedValue(['.git', 'README.md']);

    const result = await isRepositoryCloned(mockRepository);

    expect(result).toBe(true);
    expect(mockFs.promises.readdir).toHaveBeenCalledWith('/repos/user/test-repo');
  });

  it('リポジトリがクローンされていない場合、falseを返す', async () => {
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.readdir).mockRejectedValue(new Error('ENOENT'));

    const result = await isRepositoryCloned(mockRepository);

    expect(result).toBe(false);
  });
});

describe('readFile', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ファイルを読み込む', async () => {
    const content = 'Hello, World!';
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.readFile).mockResolvedValue(content as unknown as Uint8Array);

    const result = await readFile(mockRepository, 'test.md');

    expect(result).toBe(content);
    expect(mockFs.promises.readFile).toHaveBeenCalledWith(
      '/repos/user/test-repo/test.md',
      'utf8'
    );
  });

  it('パスの先頭のスラッシュを正規化する', async () => {
    const content = 'Content';
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.readFile).mockResolvedValue(content as unknown as Uint8Array);

    await readFile(mockRepository, '/test.md');

    expect(mockFs.promises.readFile).toHaveBeenCalledWith(
      '/repos/user/test-repo/test.md',
      'utf8'
    );
  });
});

describe('createFile', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ファイルを作成する', async () => {
    const content = 'Hello, World!';
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.writeFile).mockResolvedValue(undefined);
    const mockStats: MockStats = {
      isDirectory: () => true,
      isFile: () => false,
      size: 0,
      mtime: new Date(),
    };
    vi.mocked(mockFs.promises.stat).mockResolvedValue(mockStats as unknown as Awaited<ReturnType<typeof mockFs.promises.stat>>);

    await createFile(mockRepository, 'test.md', content);

    expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
      '/repos/user/test-repo/test.md',
      content,
      'utf8'
    );
  });

  it('親ディレクトリが存在しない場合、作成する', async () => {
    const content = 'Content';
    const mockFs = getFileSystem();
    // ensureDirectoryExists内でstatが呼ばれる
    // 親ディレクトリが存在しない場合
    vi.mocked(mockFs.promises.stat)
      .mockRejectedValueOnce(new Error('ENOENT')) // 親ディレクトリ（dir）が存在しない
      .mockRejectedValueOnce(new Error('ENOENT')); // ルートディレクトリも存在しない（再帰的に作成される）
    vi.mocked(mockFs.promises.mkdir).mockResolvedValue(undefined);
    vi.mocked(mockFs.promises.writeFile).mockResolvedValue(undefined);

    await createFile(mockRepository, 'dir/test.md', content);

    // ensureDirectoryExistsが親ディレクトリを作成する
    expect(mockFs.promises.mkdir).toHaveBeenCalledWith('/repos/user/test-repo/dir');
    expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
      '/repos/user/test-repo/dir/test.md',
      content,
      'utf8'
    );
  });

  it('パスの先頭のスラッシュを正規化する', async () => {
    const content = 'Content';
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.writeFile).mockResolvedValue(undefined);
    const mockStats: MockStats = {
      isDirectory: () => true,
      isFile: () => false,
      size: 0,
      mtime: new Date(),
    };
    vi.mocked(mockFs.promises.stat).mockResolvedValue(mockStats as unknown as Awaited<ReturnType<typeof mockFs.promises.stat>>);

    await createFile(mockRepository, '/test.md', content);

    expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
      '/repos/user/test-repo/test.md',
      content,
      'utf8'
    );
  });
});

describe('deleteFile', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ファイルを削除する', async () => {
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.unlink).mockResolvedValue(undefined);

    await deleteFile(mockRepository, 'test.md');

    expect(mockFs.promises.unlink).toHaveBeenCalledWith('/repos/user/test-repo/test.md');
  });

  it('パスの先頭のスラッシュを正規化する', async () => {
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.unlink).mockResolvedValue(undefined);

    await deleteFile(mockRepository, '/test.md');

    expect(mockFs.promises.unlink).toHaveBeenCalledWith('/repos/user/test-repo/test.md');
  });
});

describe('ensureDirectoryExists', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ディレクトリが既に存在する場合、何もしない', async () => {
    const mockFs = getFileSystem();
    const mockStats: MockStats = {
      isDirectory: () => true,
      isFile: () => false,
      size: 0,
      mtime: new Date(),
    };
    vi.mocked(mockFs.promises.stat).mockResolvedValue(mockStats as unknown as Awaited<ReturnType<typeof mockFs.promises.stat>>);

    await ensureDirectoryExists(mockRepository, 'dir');

    expect(mockFs.promises.mkdir).not.toHaveBeenCalled();
  });

  it('ディレクトリが存在しない場合、作成する', async () => {
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.stat).mockRejectedValue(new Error('ENOENT'));
    vi.mocked(mockFs.promises.mkdir).mockResolvedValue(undefined);

    await ensureDirectoryExists(mockRepository, 'dir');

    expect(mockFs.promises.mkdir).toHaveBeenCalledWith('/repos/user/test-repo/dir');
  });

  it('ネストされたディレクトリを再帰的に作成する', async () => {
    const mockFs = getFileSystem();
    // 各ディレクトリが存在しない場合
    vi.mocked(mockFs.promises.stat)
      .mockRejectedValueOnce(new Error('ENOENT')) // parent/dir
      .mockRejectedValueOnce(new Error('ENOENT')); // parent
    vi.mocked(mockFs.promises.mkdir).mockResolvedValue(undefined);

    await ensureDirectoryExists(mockRepository, 'parent/dir');

    expect(mockFs.promises.mkdir).toHaveBeenCalledWith('/repos/user/test-repo/parent');
    expect(mockFs.promises.mkdir).toHaveBeenCalledWith('/repos/user/test-repo/parent/dir');
  });

  it('パスの先頭と末尾のスラッシュを正規化する', async () => {
    const mockFs = getFileSystem();
    vi.mocked(mockFs.promises.stat).mockRejectedValue(new Error('ENOENT'));
    vi.mocked(mockFs.promises.mkdir).mockResolvedValue(undefined);

    await ensureDirectoryExists(mockRepository, '/dir/');

    expect(mockFs.promises.mkdir).toHaveBeenCalledWith('/repos/user/test-repo/dir');
  });
});

describe('getCurrentBranch', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('現在のブランチ名を取得する', async () => {
    const branchName = 'main';
    const mockFs = getFileSystem();
    vi.mocked(git.currentBranch).mockResolvedValue(branchName);

    const result = await getCurrentBranch(mockRepository);

    expect(result).toBe(branchName);
    expect(git.currentBranch).toHaveBeenCalledWith({
      fs: mockFs,
      dir: '/repos/user/test-repo',
    });
  });

  it('ブランチが存在しない場合、nullを返す', async () => {
    vi.mocked(git.currentBranch).mockRejectedValue(new Error('No branch found'));

    const result = await getCurrentBranch(mockRepository);

    expect(result).toBeNull();
  });

  it('ブランチ名がundefinedの場合、nullを返す', async () => {
    vi.mocked(git.currentBranch).mockResolvedValue(undefined);

    const result = await getCurrentBranch(mockRepository);

    expect(result).toBeNull();
  });
});
