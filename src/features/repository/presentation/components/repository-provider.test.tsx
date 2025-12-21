import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { RepositoryProvider } from './repository-provider';
import { repositoryStore } from '@/features/repository/application/stores/repository-store';

// repositoryStoreをモック
vi.mock('@/features/repository/application/stores/repository-store', () => ({
  repositoryStore: {
    initialize: vi.fn()
  }
}));

describe('RepositoryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call initialize on mount', () => {
    render(
      <RepositoryProvider>
        <div>Test Content</div>
      </RepositoryProvider>
    );

    expect(repositoryStore.initialize).toHaveBeenCalledTimes(1);
  });

  it('should render children correctly', () => {
    const { getAllByText } = render(
      <RepositoryProvider>
        <div>Test Content</div>
      </RepositoryProvider>
    );

    expect(getAllByText('Test Content').length).toBeGreaterThan(0);
  });

  it('should call initialize only once even with multiple renders', () => {
    const { rerender } = render(
      <RepositoryProvider>
        <div>Test Content</div>
      </RepositoryProvider>
    );

    rerender(
      <RepositoryProvider>
        <div>Test Content Updated</div>
      </RepositoryProvider>
    );

    // useEffectは初回マウント時のみ実行されるため、1回のみ
    expect(repositoryStore.initialize).toHaveBeenCalledTimes(1);
  });
});

