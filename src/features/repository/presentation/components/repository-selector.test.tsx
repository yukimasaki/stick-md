import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { RepositorySelector } from './repository-selector';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';

// Mock useRepository
vi.mock('@/features/repository/presentation/hooks/use-repository');

// Mock Server Action
vi.mock('@/app/_actions/repository', () => ({
  getUserRepositories: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe('RepositorySelector', () => {
  const mockActions = {
    selectRepository: vi.fn(),
    setRepositories: vi.fn(),
    setLoading: vi.fn(),
  };

  const mockRepos = [
    { id: '1', name: 'repo-1', full_name: 'user/repo-1', private: false },
    { id: '2', name: 'repo-2', full_name: 'user/repo-2', private: true },
  ];

  it('renders input with placeholder', () => {
    vi.mocked(useRepository).mockReturnValue({
      repositories: [],
      selectedRepositoryId: null,
      isLoading: false,
      actions: mockActions,
    });

    render(<RepositorySelector />);
    expect(screen.getByPlaceholderText('Select a repository...')).toBeDefined();
  });

  it('renders selected repository name in input', () => {
    vi.mocked(useRepository).mockReturnValue({
      repositories: mockRepos,
      selectedRepositoryId: '1',
      isLoading: false,
      actions: mockActions,
    });

    render(<RepositorySelector />);
    const input = screen.getByPlaceholderText('Select a repository...') as HTMLInputElement;
    expect(input.value).toBe('user/repo-1');
  });

  it('opens dropdown and shows repository options', async () => {
    vi.mocked(useRepository).mockReturnValue({
      repositories: mockRepos,
      selectedRepositoryId: null,
      isLoading: false,
      actions: mockActions,
    });

    render(<RepositorySelector />);
    
    const input = screen.getByPlaceholderText('Select a repository...');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('user/repo-1')).toBeDefined();
      expect(screen.getByText('user/repo-2')).toBeDefined();
    });
  });

  it('filters repositories based on search input', async () => {
    vi.mocked(useRepository).mockReturnValue({
      repositories: mockRepos,
      selectedRepositoryId: null,
      isLoading: false,
      actions: mockActions,
    });

    render(<RepositorySelector />);
    
    const input = screen.getByPlaceholderText('Select a repository...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'repo-1' } });

    await waitFor(() => {
      expect(screen.getByText('user/repo-1')).toBeDefined();
      expect(screen.queryByText('user/repo-2')).toBeNull();
    });
  });

  it('calls selectRepository when repository is selected', async () => {
    vi.mocked(useRepository).mockReturnValue({
      repositories: mockRepos,
      selectedRepositoryId: null,
      isLoading: false,
      actions: mockActions,
    });

    render(<RepositorySelector />);
    
    const input = screen.getByPlaceholderText('Select a repository...');
    fireEvent.focus(input);

    await waitFor(() => {
      const repo1Option = screen.getByText('user/repo-1');
      fireEvent.click(repo1Option);
    });

    expect(mockActions.selectRepository).toHaveBeenCalledWith('1');
  });
});
