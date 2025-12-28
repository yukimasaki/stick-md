import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { SaveButton } from './save-button';

// window.matchMediaをモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
import * as fileSaveService from '@/features/editor/application/services/file-save-service';
import * as tabStore from '@/features/editor/application/stores/tab-store';
import * as repositoryStore from '@/features/repository/application/stores/repository-store';
import * as TE from 'fp-ts/TaskEither';
import type { TabState } from '@/features/editor/domain/models/tab-state';
import type { Repository } from '@/features/repository/domain/models/repository';
import type { FileSaveError } from '@/features/editor/domain/services/file-save-error';

// モックメッセージ
const mockMessages = {
  saveButton: {
    tooltip: 'Save',
  },
};

// NextIntlClientProviderでラップするヘルパー関数
const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <NextIntlClientProvider messages={mockMessages} locale="en">
      {ui}
    </NextIntlClientProvider>
  );
};

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

describe('SaveButton', () => {
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

  interface RepositoryState {
    repositories: Repository[];
    selectedRepositoryId: string | null;
    isLoading: boolean;
  }

  const mockRepositoryState: RepositoryState = {
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
    vi.mocked(tabStore.tabStore.getSnapshot).mockReturnValue(mockTabState as TabState);
    vi.mocked(repositoryStore.repositoryStore.subscribe).mockImplementation(() => () => {});
    vi.mocked(repositoryStore.repositoryStore.getSnapshot).mockReturnValue(mockRepositoryState as RepositoryState);
  });

  it('保存ボタンが表示される', () => {
    renderWithIntl(<SaveButton />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('ボタンクリックで保存が実行される', async () => {
    vi.mocked(fileSaveService.saveFile).mockReturnValue(
      TE.right(undefined) as TE.TaskEither<FileSaveError, void>
    );

    renderWithIntl(<SaveButton />);
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
    vi.mocked(tabStore.tabStore.getSnapshot).mockReturnValue(tabStateWithoutActive as TabState);

    renderWithIntl(<SaveButton />);
    const buttons = screen.getAllByRole('button');
    // 保存ボタンが無効化されていることを確認
    const saveButton = buttons.find(btn => btn.hasAttribute('disabled'));
    expect(saveButton).toBeDefined();
  });
});

