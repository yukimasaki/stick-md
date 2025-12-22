import { describe, it, expect } from 'vitest';
import * as E from 'fp-ts/Either';
import { validateCommitMessage, validateStagedFiles } from './git-commit-service';

describe('validateCommitMessage', () => {
  it('有効なコミットメッセージの場合、Rightを返す', () => {
    const result = validateCommitMessage('feat: add new feature');

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe('feat: add new feature');
    }
  });

  it('空文字列の場合、EMPTY_COMMIT_MESSAGEエラーを返す', () => {
    const result = validateCommitMessage('');

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('EMPTY_COMMIT_MESSAGE');
    }
  });

  it('空白のみの場合、EMPTY_COMMIT_MESSAGEエラーを返す', () => {
    const result = validateCommitMessage('   ');

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('EMPTY_COMMIT_MESSAGE');
    }
  });

  it('改行のみの場合、EMPTY_COMMIT_MESSAGEエラーを返す', () => {
    const result = validateCommitMessage('\n\n');

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('EMPTY_COMMIT_MESSAGE');
    }
  });

  it('トリム後の空文字列の場合、EMPTY_COMMIT_MESSAGEエラーを返す', () => {
    const result = validateCommitMessage('  \n  \t  ');

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('EMPTY_COMMIT_MESSAGE');
    }
  });
});

describe('validateStagedFiles', () => {
  it('ステージ済みファイルがある場合、Rightを返す', () => {
    const stagedFiles = ['file1.md', 'file2.md'];

    const result = validateStagedFiles(stagedFiles);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(stagedFiles);
    }
  });

  it('空配列の場合、NO_STAGED_FILESエラーを返す', () => {
    const result = validateStagedFiles([]);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('NO_STAGED_FILES');
    }
  });
});

