import { Repository } from '@/features/repository/domain/models/repository';

const GITHUB_API_BASE_URL = 'https://api.github.com';

/**
 * アクセストークンを使用してGitHub APIを呼び出す
 * Infrastructure Layer: 外部サービス（GitHub API）との連携を担当
 */
async function fetchWithToken(
  endpoint: string,
  accessToken: string
): Promise<Response> {
  const response = await fetch(`${GITHUB_API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'stick-md',
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response;
}

/**
 * GitHub APIのレスポンスをドメインモデルに変換
 */
function mapGitHubRepoToDomain(repo: any): Repository {
  return {
    id: String(repo.id),
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
  };
}

/**
 * ログインユーザーのリポジトリ一覧を取得
 * Infrastructure Layer: 外部サービス（GitHub API）との連携を担当
 * 
 * 注意: GitHub APIはデフォルトで30件までしか返さないため、ページネーションを実装
 * type=all: すべてのリポジトリ（所有、フォーク、コラボレーター）を取得
 * per_page=100: 1ページあたりの最大件数（GitHub APIの上限）
 * sort=updated: 変更日の新しい順でソート
 */
export async function getUserRepositories(
  accessToken: string
): Promise<Repository[]> {
  const allRepos: Repository[] = [];
  let page = 1;
  const perPage = 100; // GitHub APIの最大値

  while (true) {
    // type=all: すべてのリポジトリ（所有、フォーク、コラボレーター）を取得
    // sort=updated: 変更日の新しい順でソート
    // per_page=100: 1ページあたりの最大件数
    const endpoint = `/user/repos?type=all&sort=updated&per_page=${perPage}&page=${page}`;
    const response = await fetchWithToken(endpoint, accessToken);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      break; // これ以上リポジトリがない
    }

    // GitHub APIのレスポンスをドメインモデルに変換
    const repos = data.map(mapGitHubRepoToDomain);
    allRepos.push(...repos);

    // 取得した件数がperPage未満の場合は、これが最後のページ
    if (data.length < perPage) {
      break;
    }

    page++;
  }

  return allRepos;
}

