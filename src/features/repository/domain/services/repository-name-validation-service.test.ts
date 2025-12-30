import { describe, it, expect } from 'vitest';
import * as E from 'fp-ts/Either';
import { validateRepositoryName } from './repository-name-validation-service';

describe('validateRepositoryName', () => {
  describe('正常系', () => {
    it('should accept valid repository names', () => {
      expect(validateRepositoryName('test')).toEqual(E.right('test'));
      expect(validateRepositoryName('my-repo')).toEqual(E.right('my-repo'));
      expect(validateRepositoryName('repo123')).toEqual(E.right('repo123'));
      expect(validateRepositoryName('test_repo')).toEqual(E.right('test_repo'));
      expect(validateRepositoryName('repo.name')).toEqual(E.right('repo.name'));
      expect(validateRepositoryName('a'.repeat(100))).toEqual(E.right('a'.repeat(100)));
    });

    it('should accept repository names with mixed valid characters', () => {
      expect(validateRepositoryName('my-repo_123.name')).toEqual(E.right('my-repo_123.name'));
      expect(validateRepositoryName('test-repo.v2')).toEqual(E.right('test-repo.v2'));
    });
  });

  describe('異常系: 空文字列', () => {
    it('should reject empty repository names', () => {
      const result = validateRepositoryName('');
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('EMPTY_NAME');
      }
    });

    it('should reject repository names with only whitespace', () => {
      const result = validateRepositoryName('   ');
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('EMPTY_NAME');
      }
    });
  });

  describe('異常系: 長さ', () => {
    it('should reject repository names that are too short', () => {
      const result = validateRepositoryName('');
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('EMPTY_NAME');
      }
    });

    it('should reject repository names that are too long', () => {
      const result = validateRepositoryName('a'.repeat(101));
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result) && result.left.type === 'INVALID_LENGTH') {
        expect(result.left.min).toBe(1);
        expect(result.left.max).toBe(100);
      }
    });
  });

  describe('異常系: 先頭・末尾のピリオド', () => {
    it('should reject repository names starting with a period', () => {
      const result = validateRepositoryName('.test');
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_START_OR_END');
      }
    });

    it('should reject repository names ending with a period', () => {
      const result = validateRepositoryName('test.');
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_START_OR_END');
      }
    });
  });

  describe('異常系: 連続するピリオド', () => {
    it('should reject repository names with consecutive periods', () => {
      const result = validateRepositoryName('test..repo');
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('CONSECUTIVE_DOTS');
      }
    });
  });

  describe('異常系: 予約語', () => {
    it('should reject reserved names', () => {
      const reservedNames = ['.git', '.', '..'];
      reservedNames.forEach((name) => {
        const result = validateRepositoryName(name);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left.type).toBe('RESERVED_NAME');
        }
      });
    });

    it('should reject reserved names case-insensitively', () => {
      const result = validateRepositoryName('.GIT');
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('RESERVED_NAME');
      }
    });
  });

  describe('異常系: 無効な文字', () => {
    it('should reject repository names with invalid characters', () => {
      const invalidChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|', ' ', '@', '#', '$', '%', '^', '&', '(', ')', '[', ']', '{', '}'];
      
      invalidChars.forEach((char) => {
        const result = validateRepositoryName(`test${char}repo`);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
          expect(result.left.type).toBe('INVALID_CHARACTER');
        }
      });
    });
  });

  describe('トリム処理', () => {
    it('should trim whitespace from repository names', () => {
      expect(validateRepositoryName('  test  ')).toEqual(E.right('test'));
    });

    it('should reject repository names that become empty after trimming', () => {
      const result = validateRepositoryName('   ');
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('EMPTY_NAME');
      }
    });
  });
});

