/**
 * コンテンツ読み込み判定の型定義
 * Domain Layer: 純粋関数（TDDで実装）
 */
export interface ContentLoadContext {
  /** タブが切り替わったかどうか */
  isTabSwitched: boolean;
  /** IME入力中かどうか */
  isComposing: boolean;
  /** 初期読み込み中かどうか */
  isInitializing: boolean;
  /** 現在のエディタの内容 */
  currentEditorContent: string;
  /** タブの内容 */
  tabContent: string;
}

/**
 * コンテンツを読み込むべきかどうかを判定
 * Domain Layer: 純粋関数（TDDで実装）
 * 
 * @param context - コンテンツ読み込み判定のコンテキスト
 * @returns 読み込むべきかどうか
 */
export function shouldLoadContent(context: ContentLoadContext): boolean {
  // タブが切り替わった場合は必ず読み込む
  if (context.isTabSwitched) {
    return true;
  }

  // IME入力中は読み込まない
  if (context.isComposing) {
    return false;
  }

  // 初期読み込み中は読み込まない
  if (context.isInitializing) {
    return false;
  }

  // 現在の内容とタブの内容が同じ場合は読み込まない
  if (context.currentEditorContent.trim() === context.tabContent.trim()) {
    return false;
  }

  // それ以外の場合は読み込む
  return true;
}

/**
 * 外部からの更新を適用すべきかどうかを判定
 * Domain Layer: 純粋関数（TDDで実装）
 */
export interface ExternalUpdateContext {
  /** タブが切り替わったかどうか */
  isTabSwitched: boolean;
  /** IME入力中かどうか */
  isComposing: boolean;
  /** 初期読み込み中かどうか */
  isInitializing: boolean;
  /** 前回読み込んだタブの内容 */
  lastLoadedContent: string | null;
  /** タブの内容 */
  tabContent: string;
  /** 現在のエディタの内容 */
  currentEditorContent: string;
}

/**
 * 外部からの更新を適用すべきかどうかを判定
 * Domain Layer: 純粋関数（TDDで実装）
 * 
 * @param context - 外部更新判定のコンテキスト
 * @returns 適用すべきかどうか
 */
export function shouldApplyExternalUpdate(context: ExternalUpdateContext): boolean {
  // タブが切り替わった場合は適用しない（メインのuseEffectで処理される）
  if (context.isTabSwitched) {
    return false;
  }

  // IME入力中は適用しない
  if (context.isComposing) {
    return false;
  }

  // 初期読み込み中は適用しない
  if (context.isInitializing) {
    return false;
  }

  // タブの内容が変更されていない場合は適用しない
  if (context.lastLoadedContent === context.tabContent) {
    return false;
  }

  // 現在の内容とタブの内容が同じ場合は適用しない（エディタからの変更）
  if (context.currentEditorContent.trim() === context.tabContent.trim()) {
    return false;
  }

  // それ以外の場合は適用する（外部からの更新）
  return true;
}

