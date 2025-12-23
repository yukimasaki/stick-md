import { describe, it, expect } from 'vitest';
import { filterRepositories } from './repository-search-service';
import { Repository } from '@/features/repository/domain/models/repository';

describe('filterRepositories', () => {
  const mockRepositories: Repository[] = [
    { id: '1', name: 'repo-1', full_name: 'user/repo-1', private: false },
    { id: '2', name: 'repo-2', full_name: 'user/repo-2', private: false },
    { id: '3', name: 'test-repo', full_name: 'org/test-repo', private: true },
    { id: '4', name: 'example', full_name: 'user/example-repo', private: false },
  ];

  it('should return all repositories when search query is empty', () => {
    const result = filterRepositories(mockRepositories, '');
    expect(result).toEqual(mockRepositories);
  });

  it('should return all repositories when search query is only whitespace', () => {
    const result = filterRepositories(mockRepositories, '   ');
    expect(result).toEqual(mockRepositories);
  });

  it('should filter repositories by full_name (case insensitive)', () => {
    const result = filterRepositories(mockRepositories, 'user/repo');
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(mockRepositories[0]);
    expect(result).toContainEqual(mockRepositories[1]);
  });

  it('should filter repositories by name (case insensitive)', () => {
    const result = filterRepositories(mockRepositories, 'test');
    expect(result).toHaveLength(1);
    expect(result).toContainEqual(mockRepositories[2]);
  });

  it('should filter repositories by partial match in full_name', () => {
    const result = filterRepositories(mockRepositories, 'example');
    expect(result).toHaveLength(1);
    expect(result).toContainEqual(mockRepositories[3]);
  });

  it('should filter repositories by partial match in name', () => {
    const result = filterRepositories(mockRepositories, 'repo');
    expect(result).toHaveLength(4); // repo-1, repo-2, test-repo, example-repo すべてマッチ
    expect(result).toContainEqual(mockRepositories[0]);
    expect(result).toContainEqual(mockRepositories[1]);
    expect(result).toContainEqual(mockRepositories[2]);
    expect(result).toContainEqual(mockRepositories[3]); // example-repo もマッチ
  });

  it('should be case insensitive', () => {
    const result1 = filterRepositories(mockRepositories, 'USER/REPO');
    const result2 = filterRepositories(mockRepositories, 'user/repo');
    expect(result1).toEqual(result2);
  });

  it('should return empty array when no repositories match', () => {
    const result = filterRepositories(mockRepositories, 'nonexistent');
    expect(result).toEqual([]);
  });

  it('should handle empty repository array', () => {
    const result = filterRepositories([], 'test');
    expect(result).toEqual([]);
  });

  it('should match repositories that match both name and full_name', () => {
    const repos: Repository[] = [
      { id: '1', name: 'test', full_name: 'user/test', private: false },
    ];
    const result = filterRepositories(repos, 'test');
    expect(result).toHaveLength(1);
    expect(result).toContainEqual(repos[0]);
  });
});

