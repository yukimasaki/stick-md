import { describe, it, expect } from 'vitest';
import { compareContent } from './content-comparison-service';

describe('content-comparison-service', () => {
  describe('compareContent', () => {
    it('両方がundefinedの場合はfalseを返す', () => {
      expect(compareContent(undefined, undefined)).toBe(false);
    });

    it('originalがundefinedでcurrentが存在する場合はtrueを返す', () => {
      expect(compareContent(undefined, 'content')).toBe(true);
    });

    it('originalが存在してcurrentがundefinedの場合はtrueを返す', () => {
      expect(compareContent('content', undefined)).toBe(true);
    });

    it('同じ内容の場合はfalseを返す', () => {
      expect(compareContent('content', 'content')).toBe(false);
    });

    it('異なる内容の場合はtrueを返す', () => {
      expect(compareContent('original', 'current')).toBe(true);
    });

    it('先頭・末尾の空白のみが異なる場合はfalseを返す', () => {
      expect(compareContent('content', '  content  ')).toBe(false);
      expect(compareContent('  content  ', 'content')).toBe(false);
    });

    it('内容が異なり、空白も異なる場合はtrueを返す', () => {
      expect(compareContent('original', '  current  ')).toBe(true);
    });

    it('空文字列同士の場合はfalseを返す', () => {
      expect(compareContent('', '')).toBe(false);
    });

    it('空文字列と空白のみの場合はfalseを返す', () => {
      expect(compareContent('', '   ')).toBe(false);
      expect(compareContent('   ', '')).toBe(false);
    });

    it('空文字列と内容がある場合はtrueを返す', () => {
      expect(compareContent('', 'content')).toBe(true);
      expect(compareContent('content', '')).toBe(true);
    });
  });
});

