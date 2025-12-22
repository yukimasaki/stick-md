import * as E from 'fp-ts/Either';
import type { TabState, Tab } from '@/features/editor/domain/models/tab-state';
import type { Repository } from '@/features/repository/domain/models/repository';
import type { FileSaveError } from './file-save-error';

/**
 * 保存リクエストのバリデーション結果
 */
export interface SaveRequest {
  tab: Tab;
  repository: Repository;
}

/**
 * 保存リクエストをバリデーション
 * Domain Layer: 純粋関数による保存リクエストのバリデーション
 * 
 * @param tabState - タブ状態
 * @param repositories - リポジトリ一覧
 * @returns Either<FileSaveError, SaveRequest> - バリデーション結果
 */
export function validateSaveRequest(
  tabState: TabState,
  repositories: Repository[]
): E.Either<FileSaveError, SaveRequest> {
  // アクティブタブの存在チェック
  if (!tabState.activeTabId) {
    return E.left({
      type: 'NO_ACTIVE_TAB',
      message: 'No active tab to save',
    });
  }

  // アクティブタブの取得
  const activeTab = tabState.tabs.find(tab => tab.id === tabState.activeTabId);
  if (!activeTab) {
    return E.left({
      type: 'NO_ACTIVE_TAB',
      message: 'Active tab not found',
    });
  }

  // リポジトリの存在チェック
  const repository = repositories.find(repo => repo.id === activeTab.repositoryId);
  if (!repository) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: `Repository not found: ${activeTab.repositoryId}`,
    });
  }

  // ファイルパスの妥当性チェック
  const filePath = activeTab.filePath.trim();
  if (!filePath) {
    return E.left({
      type: 'FILE_NOT_FOUND',
      message: 'File path is empty',
      filePath: activeTab.filePath,
    });
  }

  return E.right({
    tab: activeTab,
    repository,
  });
}

