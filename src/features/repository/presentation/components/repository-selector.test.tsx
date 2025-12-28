import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { RepositorySelector } from './repository-selector';
import { useRepositorySelector } from '@/features/repository/presentation/hooks/use-repository-selector';

// Mock useRepositorySelector
vi.mock('@/features/repository/presentation/hooks/use-repository-selector');

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

    render(<RepositorySelector />);
    expect(screen.getByText('Select a repository...')).toBeDefined();
  });

  it('renders selected repository name', () => {
    vi.mocked(useRepositorySelector).mockReturnValue({
      ...defaultMockReturn,
      repositories: mockRepos,
      displayRepo: mockRepos[0],
      displayRepoId: '1',
    });

    render(<RepositorySelector />);
    expect(screen.getByText('user/repo-1')).toBeDefined();
  });

  it('disables Select when isLoading is true', () => {
    vi.mocked(useRepositorySelector).mockReturnValue({
      ...defaultMockReturn,
      isLoading: true,
    });

    render(<RepositorySelector />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.hasAttribute('disabled')).toBe(true);
  });

  it('renders Select when repositories are empty', () => {
    vi.mocked(useRepositorySelector).mockReturnValue(defaultMockReturn);

    render(<RepositorySelector />);
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

    render(<RepositorySelector />);
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

      render(<RepositorySelector />);
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

      render(<RepositorySelector />);
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

      render(<RepositorySelector />);
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

      render(<RepositorySelector accessToken="test-token" />);
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

      render(<RepositorySelector />);
      expect(screen.getByText('作業リポジトリを切り替え')).toBeDefined();
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

      render(<RepositorySelector />);
      const button = screen.getByText('作業リポジトリを切り替え');
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

      render(<RepositorySelector />);
      expect(screen.queryByText('Clone')).toBeNull();
      expect(screen.getByText('作業リポジトリを切り替え')).toBeDefined();
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

      render(<RepositorySelector />);
      expect(screen.getByText('閉じる')).toBeDefined();
      expect(screen.queryByText('Clone')).toBeNull();
      expect(screen.queryByText('作業リポジトリを切り替え')).toBeNull();
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

      render(<RepositorySelector />);
      const button = screen.getByText('閉じる');
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

      render(<RepositorySelector />);
      expect(screen.queryByText('Clone')).toBeNull();
      expect(screen.queryByText('作業リポジトリを切り替え')).toBeNull();
      expect(screen.getByText('閉じる')).toBeDefined();
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

      render(<RepositorySelector />);
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

      render(<RepositorySelector />);
      expect(screen.queryByText(/Failed to clone/i)).toBeNull();
    });
  });
});
