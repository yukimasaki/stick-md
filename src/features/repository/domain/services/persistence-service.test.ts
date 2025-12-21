import { describe, it, expect } from 'vitest';
import * as E from 'fp-ts/Either';
import { validatePersistedState, type PersistedRepositoryState } from './persistence-service';

describe('validatePersistedState', () => {
  it('should validate correct persisted state', () => {
    const validState: PersistedRepositoryState = {
      selectedRepositoryId: 'repo-1'
    };

    const result = validatePersistedState(validState);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(validState);
    }
  });

  it('should validate state with null selectedRepositoryId', () => {
    const validState: PersistedRepositoryState = {
      selectedRepositoryId: null
    };

    const result = validatePersistedState(validState);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(validState);
    }
  });

  it('should reject invalid data - missing selectedRepositoryId', () => {
    const invalidState = {};

    const result = validatePersistedState(invalidState);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('INVALID_DATA');
    }
  });

  it('should reject invalid data - selectedRepositoryId is not string or null', () => {
    const invalidState = {
      selectedRepositoryId: 123
    };

    const result = validatePersistedState(invalidState);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('INVALID_DATA');
    }
  });

  it('should reject null input', () => {
    const result = validatePersistedState(null);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('INVALID_DATA');
    }
  });

  it('should reject undefined input', () => {
    const result = validatePersistedState(undefined);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('INVALID_DATA');
    }
  });

  it('should reject non-object input', () => {
    const result = validatePersistedState('invalid');

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('INVALID_DATA');
    }
  });
});

