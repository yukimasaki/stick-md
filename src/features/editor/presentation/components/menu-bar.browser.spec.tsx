import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MenuBar } from './menu-bar';
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

describe('MenuBar', () => {
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

  it('Fileメニューが表示される', () => {
    render(<MenuBar />);
    const fileMenus = screen.getAllByText('File');
    expect(fileMenus.length).toBeGreaterThan(0);
  });

  it('Ctrl+Sキーで保存が実行される', async () => {
    vi.mocked(fileSaveService.saveFile).mockReturnValue(
      async () => E.right(undefined) as any
    );

    render(<MenuBar />);

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(fileSaveService.saveFile).toHaveBeenCalled();
    });
  });

  it('Cmd+Sキー（Mac）で保存が実行される', async () => {
    // navigator.platformをモック
    Object.defineProperty(navigator, 'platform', {
      writable: true,
      value: 'MacIntel',
    });

    vi.mocked(fileSaveService.saveFile).mockReturnValue(
      async () => E.right(undefined) as any
    );

    render(<MenuBar />);

    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(fileSaveService.saveFile).toHaveBeenCalled();
    });
  });
});

