import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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

  it('renders Select component with placeholder', () => {
    vi.mocked(useRepositorySelector).mockReturnValue({
      repositories: [],
      displayRepo: null,
      displayRepoId: '',
      isLoading: false,
      isCloned: false,
      isCloning: false,
      cloneError: null,
      handleSelect: vi.fn(),
      handleClone: vi.fn(),
    });

    render(<RepositorySelector />);
    expect(screen.getByText('Select a repository...')).toBeDefined();
  });

  it('renders selected repository name', () => {
    vi.mocked(useRepositorySelector).mockReturnValue({
      repositories: mockRepos,
      displayRepo: mockRepos[0],
      displayRepoId: '1',
      isLoading: false,
      isCloned: false,
      isCloning: false,
      cloneError: null,
      handleSelect: vi.fn(),
      handleClone: vi.fn(),
    });

    render(<RepositorySelector />);
    expect(screen.getByText('user/repo-1')).toBeDefined();
  });

  it('disables Select when isLoading is true', () => {
    vi.mocked(useRepositorySelector).mockReturnValue({
      repositories: [],
      displayRepo: null,
      displayRepoId: '',
      isLoading: true,
      isCloned: false,
      isCloning: false,
      cloneError: null,
      handleSelect: vi.fn(),
      handleClone: vi.fn(),
    });

    render(<RepositorySelector />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.hasAttribute('disabled')).toBe(true);
  });

  it('renders Select when repositories are empty', () => {
    vi.mocked(useRepositorySelector).mockReturnValue({
      repositories: [],
      displayRepo: null,
      displayRepoId: '',
      isLoading: false,
      isCloned: false,
      isCloning: false,
      cloneError: null,
      handleSelect: vi.fn(),
      handleClone: vi.fn(),
    });

    render(<RepositorySelector />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDefined();
  });

  it('renders Select component with repositories', () => {
    const mockHandleSelect = vi.fn();
    vi.mocked(useRepositorySelector).mockReturnValue({
      repositories: mockRepos,
      displayRepo: null,
      displayRepoId: '',
      isLoading: false,
      isCloned: false,
      isCloning: false,
      cloneError: null,
      handleSelect: mockHandleSelect,
      handleClone: vi.fn(),
    });

    render(<RepositorySelector />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDefined();
    expect(mockHandleSelect).toBeDefined();
  });
});
