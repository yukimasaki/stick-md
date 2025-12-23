import { Repository } from '@/features/repository/domain/models/repository';

/**
 * リポジトリを検索クエリでフィルタリング
 * Domain Layer: 純粋関数による検索ロジック
 * 
 * @param repositories - フィルタリング対象のリポジトリ配列
 * @param searchQuery - 検索クエリ（空文字列の場合は全件返す）
 * @returns フィルタリングされたリポジトリ配列
 */
export function filterRepositories(
  repositories: Repository[],
  searchQuery: string
): Repository[] {
  if (!searchQuery.trim()) {
    return repositories;
  }

  const lowerSearch = searchQuery.toLowerCase();
  return repositories.filter(repo => 
    repo.full_name.toLowerCase().includes(lowerSearch) ||
    repo.name.toLowerCase().includes(lowerSearch)
  );
}

