import { describe, it, expect } from 'vitest';
import { getRepositoryPath } from '../git-client';
import { Repository } from '@/features/repository/domain/models/repository';

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
});

