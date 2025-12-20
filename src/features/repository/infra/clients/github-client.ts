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
 */
export async function getUserRepositories(
  accessToken: string
): Promise<Repository[]> {
  const response = await fetchWithToken('/user/repos', accessToken);
  const data = await response.json();

  // GitHub APIのレスポンスをドメインモデルに変換
  return data.map(mapGitHubRepoToDomain);
}

