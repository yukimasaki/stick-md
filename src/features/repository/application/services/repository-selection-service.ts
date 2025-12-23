import { Repository } from '@/features/repository/domain/models/repository';
import { isRepositoryCloned } from '@/features/shared/infra/clients/git-client';

/**
 * リポジトリ選択の状態管理
 * Application Layer: リポジトリ選択に関するユースケース
 */
export interface RepositorySelectionState {
  /** 現在の作業リポジトリID */
  selectedRepositoryId: string | null;
  /** 候補リポジトリID（コンボボックスで選択されたが、まだ作業リポジトリには設定されていない） */
  pendingRepositoryId: string | null;
}

/**
 * 表示用のリポジトリを取得
 * 候補リポジトリがある場合は候補を、なければ現在の作業リポジトリを返す
 * 
 * @param repositories - リポジトリ配列
 * @param state - リポジトリ選択状態
 * @returns 表示用のリポジトリ（存在しない場合はnull）
 */
export function getDisplayRepository(
  repositories: Repository[],
  state: RepositorySelectionState
): Repository | null {
  const targetId = state.pendingRepositoryId || state.selectedRepositoryId;
  if (!targetId) {
    return null;
  }
  return repositories.find(r => r.id === targetId) || null;
}

/**
 * リポジトリがクローン済みか確認
 * Application Layer: クローン状態確認のユースケース
 * 
 * @param repository - 確認対象のリポジトリ
 * @returns クローン済みの場合true
 */
export async function checkRepositoryCloned(
  repository: Repository | null
): Promise<boolean> {
  if (!repository) {
    return false;
  }

  try {
    return await isRepositoryCloned(repository);
  } catch (error) {
    console.error('Failed to check repository clone status:', error);
    return false;
  }
}

