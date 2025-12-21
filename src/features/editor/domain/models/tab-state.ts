/**
 * タブの型定義
 * Domain Layer: タブ状態のモデル
 */
export interface Tab {
  id: string;
  filePath: string;
  repositoryId: string;
  title: string;
  content?: string; // ファイル内容（オプション、メモリ効率のため）
}

/**
 * タブ状態の型定義
 * Domain Layer: タブ状態のモデル
 */
export interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  visibleTabIds: string[]; // 表示中のタブID（最大3つ）
}

/**
 * 空のタブ状態を取得
 * Domain Layer: タブ状態のモデル
 */
export function createEmptyTabState(): TabState {
  return {
    tabs: [],
    activeTabId: null,
    visibleTabIds: [],
  };
}

