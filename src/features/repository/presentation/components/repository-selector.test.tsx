import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { RepositorySelector } from './repository-selector';
import { useRepositorySelector } from '@/features/repository/presentation/hooks/use-repository-selector';

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

// Mock useRepositorySelector
vi.mock('@/features/repository/presentation/hooks/use-repository-selector');

// モックメッセージ
const mockMessages = {
  repositorySelector: {
    placeholder: 'Select a repository...',
    loading: 'Loading repositories...',
    noRepositories: 'No repositories found',
    close: 'Close',
    switchRepository: 'Switch Active Repository',
    cloning: 'Cloning...',
    clone: 'Clone',
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

afterEach(() => {
  cleanup();
});

describe('RepositorySelector', () => {
  const mockRepos = [
    { id: '1', name: 'repo-1', full_name: 'user/repo-1', private: false },
    { id: '2', name: 'repo-2', full_name: 'user/repo-2', private: true },
  ];

  const defaultMockReturn = {
    repositories: [],
    displayRepo: null,
    displayRepoId: '',
    isLoading: false,
    isCloned: false,
    isCloning: false,
    cloneError: null,
    isCurrentRepository: false,
    handleSelect: vi.fn(),
    handleClone: vi.fn(),
    handleSwitchRepository: vi.fn(),
    handleClose: vi.fn(),
  };

  it('renders Select component with placeholder', () => {
    vi.mocked(useRepositorySelector).mockReturnValue(defaultMockReturn);

    renderWithIntl(<RepositorySelector />);
    expect(screen.getByText('Select a repository...')).toBeDefined();
  });

  it('renders selected repository name', () => {
    vi.mocked(useRepositorySelector).mockReturnValue({
      ...defaultMockReturn,
      repositories: mockRepos,
      displayRepo: mockRepos[0],
      displayRepoId: '1',
    });

    renderWithIntl(<RepositorySelector />);
    expect(screen.getByText('user/repo-1')).toBeDefined();
  });

  it('disables Select when isLoading is true', () => {
    vi.mocked(useRepositorySelector).mockReturnValue({
      ...defaultMockReturn,
      isLoading: true,
    });

    renderWithIntl(<RepositorySelector />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.hasAttribute('disabled')).toBe(true);
  });

  it('renders Select when repositories are empty', () => {
    vi.mocked(useRepositorySelector).mockReturnValue(defaultMockReturn);

    renderWithIntl(<RepositorySelector />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDefined();
  });

  it('renders Select component with repositories', () => {
    const mockHandleSelect = vi.fn();
    vi.mocked(useRepositorySelector).mockReturnValue({
      ...defaultMockReturn,
      repositories: mockRepos,
      handleSelect: mockHandleSelect,
    });

    renderWithIntl(<RepositorySelector />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDefined();
    expect(mockHandleSelect).toBeDefined();
  });

  describe('Clone button', () => {
    it('renders Clone button when repository is not cloned', () => {
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: false,
      });

      renderWithIntl(<RepositorySelector />);
      expect(screen.getByText('Clone')).toBeDefined();
    });

    it('disables Clone button when cloning', () => {
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: false,
        isCloning: true,
      });

      renderWithIntl(<RepositorySelector />);
      const button = screen.getByText('Cloning...');
      expect(button).toBeDefined();
      expect(button.hasAttribute('disabled')).toBe(true);
    });

    it('disables Clone button when accessToken is missing', () => {
      const mockHandleClone = vi.fn();
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: false,
        handleClone: mockHandleClone,
      });

      renderWithIntl(<RepositorySelector />);
      const button = screen.getByText('Clone');
      expect(button.hasAttribute('disabled')).toBe(true);
    });

    it('calls handleClone when Clone button is clicked', () => {
      const mockHandleClone = vi.fn();
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: false,
        handleClone: mockHandleClone,
      });

      renderWithIntl(<RepositorySelector accessToken="test-token" />);
      const button = screen.getByText('Clone');
      fireEvent.click(button);

      expect(mockHandleClone).toHaveBeenCalledTimes(1);
    });
  });

  describe('Switch repository button', () => {
    it('renders "作業リポジトリを切り替え" button when repository is cloned and not current', () => {
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: true,
        isCurrentRepository: false,
      });

      renderWithIntl(<RepositorySelector />);
      expect(screen.getByText('Switch Active Repository')).toBeDefined();
      expect(screen.queryByText('Clone')).toBeNull();
      expect(screen.queryByText('閉じる')).toBeNull();
    });

    it('calls handleSwitchRepository when switch button is clicked', () => {
      const mockHandleSwitchRepository = vi.fn();
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: true,
        isCurrentRepository: false,
        handleSwitchRepository: mockHandleSwitchRepository,
      });

      renderWithIntl(<RepositorySelector />);
      const button = screen.getByText('Switch Active Repository');
      fireEvent.click(button);

      expect(mockHandleSwitchRepository).toHaveBeenCalledTimes(1);
    });

    it('does not render Clone button when repository is cloned', () => {
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: true,
        isCurrentRepository: false,
      });

      renderWithIntl(<RepositorySelector />);
      expect(screen.queryByText('Clone')).toBeNull();
      expect(screen.getByText('Switch Active Repository')).toBeDefined();
    });
  });

  describe('Close button', () => {
    it('renders "閉じる" button when repository is cloned and is current repository', () => {
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: true,
        isCurrentRepository: true,
      });

      renderWithIntl(<RepositorySelector />);
      expect(screen.getByText('Close')).toBeDefined();
      expect(screen.queryByText('Clone')).toBeNull();
      expect(screen.queryByText('Switch Active Repository')).toBeNull();
    });

    it('calls handleClose when close button is clicked', () => {
      const mockHandleClose = vi.fn();
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: true,
        isCurrentRepository: true,
        handleClose: mockHandleClose,
      });

      renderWithIntl(<RepositorySelector />);
      const button = screen.getByText('Close');
      fireEvent.click(button);

      expect(mockHandleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render switch or clone button when repository is cloned and is current', () => {
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: true,
        isCurrentRepository: true,
      });

      renderWithIntl(<RepositorySelector />);
      expect(screen.queryByText('Clone')).toBeNull();
      expect(screen.queryByText('Switch Active Repository')).toBeNull();
      expect(screen.getByText('Close')).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('displays clone error message when cloneError is set', () => {
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: false,
        cloneError: 'Failed to clone repository',
      });

      renderWithIntl(<RepositorySelector />);
      expect(screen.getByText('Failed to clone repository')).toBeDefined();
    });

    it('does not display error message when cloneError is null', () => {
      vi.mocked(useRepositorySelector).mockReturnValue({
        ...defaultMockReturn,
        repositories: mockRepos,
        displayRepo: mockRepos[0],
        displayRepoId: '1',
        isCloned: false,
        cloneError: null,
      });

      renderWithIntl(<RepositorySelector />);
      expect(screen.queryByText(/Failed to clone/i)).toBeNull();
    });
  });
});
