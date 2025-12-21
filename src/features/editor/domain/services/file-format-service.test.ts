import { describe, it, expect } from 'vitest';
import { isSupportedFileFormat, getSupportedExtensions } from './file-format-service';

describe('file-format-service', () => {
  describe('isSupportedFileFormat', () => {
    it('Markdownファイル（.md）を正しく認識する', () => {
      expect(isSupportedFileFormat('test.md')).toBe(true);
      expect(isSupportedFileFormat('README.md')).toBe(true);
      expect(isSupportedFileFormat('path/to/file.md')).toBe(true);
    });

    it('大文字小文字を区別しない', () => {
      expect(isSupportedFileFormat('TEST.MD')).toBe(true);
      expect(isSupportedFileFormat('Test.Md')).toBe(true);
      expect(isSupportedFileFormat('test.MD')).toBe(true);
    });

    it('非対応ファイル形式を正しく拒否する', () => {
      expect(isSupportedFileFormat('test.txt')).toBe(false);
      expect(isSupportedFileFormat('test.js')).toBe(false);
      expect(isSupportedFileFormat('test.ts')).toBe(false);
      expect(isSupportedFileFormat('test.json')).toBe(false);
      expect(isSupportedFileFormat('test')).toBe(false);
    });

    it('拡張子が含まれていても末尾でない場合は拒否する', () => {
      expect(isSupportedFileFormat('test.md.backup')).toBe(false);
      expect(isSupportedFileFormat('md.test')).toBe(false);
    });
  });

  describe('getSupportedExtensions', () => {
    it('対応拡張子のリストを返す', () => {
      const extensions = getSupportedExtensions();
      expect(extensions).toContain('.md');
      expect(extensions.length).toBe(1);
    });
  });
});

