import { Repository } from '@/features/repository/domain/models/repository';

const GITHUB_API_BASE_URL = 'https://api.github.com';

/**
 * GitHub APIのリポジトリレスポンス型
 * Infrastructure Layer: 外部APIの型定義
 */
interface GitHubRepositoryResponse {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}

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
function mapGitHubRepoToDomain(repo: GitHubRepositoryResponse): Repository {
  return {
    id: String(repo.id),
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
  };
}

/**
 * GitHub APIのユーザー情報レスポンス型
 * Infrastructure Layer: 外部APIの型定義
 */
interface GitHubUserResponse {
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

/**
 * ログインユーザーのGitHub情報を取得
 * Infrastructure Layer: 外部サービス（GitHub API）との連携を担当
 */
export async function getGitHubUser(
  accessToken: string
): Promise<{ name: string; email: string }> {
  const response = await fetchWithToken('/user', accessToken);
  const data: GitHubUserResponse = await response.json();

  // emailがnullの場合は、公開emailを取得する
  let email = data.email;
  if (!email) {
    try {
      const emailsResponse = await fetchWithToken('/user/emails', accessToken);
      const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsResponse.json();
      // プライマリで検証済みのemailを優先
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      email = primaryEmail?.email || emails.find((e) => e.verified)?.email || emails[0]?.email || null;
    } catch {
      // email取得に失敗した場合は、login名を使用
      email = `${data.login}@users.noreply.github.com`;
    }
  }

  return {
    name: data.name || data.login,
    email: email || `${data.login}@users.noreply.github.com`,
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

