import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileSaveButton } from './mobile-save-button';
import * as fileSaveService from '@/features/editor/application/services/file-save-service';
import * as tabStore from '@/features/editor/application/stores/tab-store';
import * as repositoryStore from '@/features/repository/application/stores/repository-store';
import * as E from 'fp-ts/Either';

// モック
vi.mock('@/features/editor/application/services/file-save-service');
vi.mock('@/features/editor/application/stores/tab-store');
vi.mock('@/features/repository/application/stores/repository-store');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('MobileSaveButton', () => {
  const mockTabState = {
    tabs: [
      {
        id: 'tab-1',
        filePath: 'test.md',
        repositoryId: 'repo-1',
        title: 'test.md',
        content: '# Test',
        originalContent: '# Test',
        isDirty: false,
      },
    ],
    activeTabId: 'tab-1',
    visibleTabIds: ['tab-1'],
  };

  const mockRepositoryState = {
    repositories: [
      {
        id: 'repo-1',
        name: 'test-repo',
        full_name: 'user/test-repo',
        private: false,
      },
    ],
    selectedRepositoryId: 'repo-1',
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tabStore.tabStore.subscribe).mockImplementation(() => () => {});
    vi.mocked(tabStore.tabStore.getSnapshot).mockReturnValue(mockTabState as any);
    vi.mocked(repositoryStore.repositoryStore.subscribe).mockImplementation(() => () => {});
    vi.mocked(repositoryStore.repositoryStore.getSnapshot).mockReturnValue(mockRepositoryState as any);
  });

  it('保存ボタンが表示される', () => {
    render(<MobileSaveButton />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('ボタンクリックで保存が実行される', async () => {
    vi.mocked(fileSaveService.saveFile).mockReturnValue(
      async () => E.right(undefined) as any
    );

    render(<MobileSaveButton />);
    const buttons = screen.getAllByRole('button');
    // 最初のボタン（保存ボタン）をクリック
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(fileSaveService.saveFile).toHaveBeenCalled();
    });
  });

  it('アクティブタブがない場合、ボタンが無効化される', () => {
    const tabStateWithoutActive = {
      ...mockTabState,
      activeTabId: null,
    };
    vi.mocked(tabStore.tabStore.getSnapshot).mockReturnValue(tabStateWithoutActive as any);

    render(<MobileSaveButton />);
    const buttons = screen.getAllByRole('button');
    // 保存ボタンが無効化されていることを確認
    const saveButton = buttons.find(btn => btn.hasAttribute('disabled'));
    expect(saveButton).toBeDefined();
  });
});

