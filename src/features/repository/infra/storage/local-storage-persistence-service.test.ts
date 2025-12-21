import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { createLocalStoragePersistenceService } from './local-storage-persistence-service';
import type { PersistedRepositoryState } from '@/features/repository/domain/services/persistence-service';

describe('createLocalStoragePersistenceService', () => {
  const originalLocalStorage = global.localStorage;
  let mockLocalStorage: Storage;

  beforeEach(() => {
    // LocalStorageのモックを作成
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };

    // global.localStorageをモックに置き換え
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // 元のlocalStorageに戻す
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true
    });
    vi.clearAllMocks();
  });

  it('should save state to localStorage successfully', () => {
    const service = createLocalStoragePersistenceService();
    const state: PersistedRepositoryState = {
      selectedRepositoryId: 'repo-1'
    };

    const result = service.save(state);

    expect(E.isRight(result)).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'repository-state',
      JSON.stringify(state)
    );
  });

  it('should save state with null selectedRepositoryId', () => {
    const service = createLocalStoragePersistenceService();
    const state: PersistedRepositoryState = {
      selectedRepositoryId: null
    };

    const result = service.save(state);

    expect(E.isRight(result)).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'repository-state',
      JSON.stringify(state)
    );
  });

  it('should load state from localStorage when data exists', () => {
    const service = createLocalStoragePersistenceService();
    const state: PersistedRepositoryState = {
      selectedRepositoryId: 'repo-1'
    };
    (mockLocalStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify(state)
    );

    const result = service.load();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(O.isSome(result.right)).toBe(true);
      if (O.isSome(result.right)) {
        expect(result.right.value).toEqual(state);
      }
    }
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('repository-state');
  });

  it('should return None when no data exists in localStorage', () => {
    const service = createLocalStoragePersistenceService();
    (mockLocalStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const result = service.load();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(O.isNone(result.right)).toBe(true);
    }
  });

  it('should return None when empty string is stored', () => {
    const service = createLocalStoragePersistenceService();
    (mockLocalStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('');

    const result = service.load();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(O.isNone(result.right)).toBe(true);
    }
  });

  it('should handle parse error when invalid JSON is stored', () => {
    const service = createLocalStoragePersistenceService();
    (mockLocalStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      'invalid json'
    );

    const result = service.load();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('PARSE_ERROR');
    }
  });

  it('should handle invalid data structure in localStorage', () => {
    const service = createLocalStoragePersistenceService();
    (mockLocalStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({ invalid: 'data' })
    );

    const result = service.load();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('INVALID_DATA');
    }
  });

  it('should handle localStorage.setItem error', () => {
    const service = createLocalStoragePersistenceService();
    (mockLocalStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        throw new Error('QuotaExceededError');
      }
    );

    const state: PersistedRepositoryState = {
      selectedRepositoryId: 'repo-1'
    };
    const result = service.save(state);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('STORAGE_UNAVAILABLE');
    }
  });

  it('should handle localStorage.getItem error', () => {
    const service = createLocalStoragePersistenceService();
    (mockLocalStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        throw new Error('SecurityError');
      }
    );

    const result = service.load();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('STORAGE_UNAVAILABLE');
    }
  });

  it('should clear localStorage successfully', () => {
    const service = createLocalStoragePersistenceService();

    const result = service.clear();

    expect(E.isRight(result)).toBe(true);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('repository-state');
  });

  it('should handle localStorage.removeItem error', () => {
    const service = createLocalStoragePersistenceService();
    (mockLocalStorage.removeItem as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        throw new Error('SecurityError');
      }
    );

    const result = service.clear();

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('STORAGE_UNAVAILABLE');
    }
  });
});

