import { describe, it, expect } from 'vitest';
import * as E from 'fp-ts/Either';
import { validateFileName, checkFileExists } from './file-name-validation-service';

describe('validateFileName', () => {
  it('should accept valid file names', () => {
    expect(validateFileName('test.md')).toEqual(E.right('test.md'));
    expect(validateFileName('my-file.md')).toEqual(E.right('my-file.md'));
    expect(validateFileName('file123.md')).toEqual(E.right('file123.md'));
    expect(validateFileName('test_1.md')).toEqual(E.right('test_1.md'));
    expect(validateFileName('.md')).toEqual(E.right('.md'));
  });

  it('should reject file names with invalid characters', () => {
    const invalidChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    
    invalidChars.forEach(char => {
      const result = validateFileName(`test${char}file.md`);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.type).toBe('INVALID_CHARACTER');
        expect(result.left.message).toContain(char);
      }
    });
  });

  it('should reject empty file names', () => {
    const result = validateFileName('');
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('EMPTY_NAME');
    }
  });

  it('should reject file names with only whitespace', () => {
    const result = validateFileName('   ');
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('EMPTY_NAME');
    }
  });

  it('should accept file names with spaces in the middle', () => {
    expect(validateFileName('my file.md')).toEqual(E.right('my file.md'));
  });

  it('should reject file names starting or ending with whitespace', () => {
    const result1 = validateFileName(' test.md');
    expect(E.isLeft(result1)).toBe(true);
    if (E.isLeft(result1)) {
      expect(result1.left.type).toBe('INVALID_CHARACTER');
    }

    const result2 = validateFileName('test.md ');
    expect(E.isLeft(result2)).toBe(true);
    if (E.isLeft(result2)) {
      expect(result2.left.type).toBe('INVALID_CHARACTER');
    }
  });
});

describe('checkFileExists', () => {
  it('should return true if file exists', () => {
    const existingFiles = ['test.md', 'other.md', 'dir/file.md'];
    expect(checkFileExists('test.md', existingFiles)).toBe(true);
    expect(checkFileExists('dir/file.md', existingFiles)).toBe(true);
  });

  it('should return false if file does not exist', () => {
    const existingFiles = ['test.md', 'other.md'];
    expect(checkFileExists('new.md', existingFiles)).toBe(false);
    expect(checkFileExists('dir/new.md', existingFiles)).toBe(false);
  });

  it('should handle empty file list', () => {
    expect(checkFileExists('test.md', [])).toBe(false);
  });

  it('should be case-sensitive', () => {
    const existingFiles = ['test.md'];
    expect(checkFileExists('Test.md', existingFiles)).toBe(false);
    expect(checkFileExists('TEST.md', existingFiles)).toBe(false);
  });
});

