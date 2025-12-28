import { describe, it, expect } from 'vitest';
import * as E from 'fp-ts/Either';
import { parseGitStatus, validateRepository } from './git-status-service';
import type { StatusResult } from '@/features/shared/infra/clients/git-client';
import { Repository } from '@/features/repository/domain/models/repository';

describe('parseGitStatus', () => {
  it('ステージ済みファイルと未ステージファイルを正しくパースできる', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 0, 2, 2], // 新規ファイルをステージング（headStatus=0, workdirStatus=2, indexStatus=2）
      ['file2.md', 1, 2, 1], // 既存ファイルを変更したがステージングしていない（headStatus=1, workdirStatus=2, indexStatus=1）
      ['file3.md', 0, 0, 0], // 変更なし（headStatus=0, workdirStatus=0, indexStatus=0）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.staged).toEqual(['file1.md']);
      expect(result.right.unstaged).toEqual(['file2.md']);
    }
  });

  it('ステージング後にさらに変更されたファイルは、StagedとUnstagedの両方に表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 3, 2], // ステージ済み + さらに変更（headStatus=1, workdirStatus=3, indexStatus=2）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus !== 0 && indexStatus !== headStatus なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus !== indexStatus なので Unstaged にも表示される
      expect(result.right.unstaged).toEqual(['file1.md']);
    }
  });

  it('新規ファイルをステージング後に編集した場合、StagedとUnstagedの両方に表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 0, 3, 2], // 新規ファイルをステージング後、さらに編集（headStatus=0, workdirStatus=3, indexStatus=2）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus !== 0 && indexStatus !== headStatus なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus !== indexStatus なので Unstaged にも表示される
      expect(result.right.unstaged).toEqual(['file1.md']);
    }
  });

  it('新規ファイルをステージングした直後は、Stagedにのみ表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 0, 2, 2], // 新規ファイルをステージング（headStatus=0, workdirStatus=2, indexStatus=2）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus !== 0 && indexStatus !== headStatus なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus === indexStatus なので Unstaged には表示されない
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('新規ファイルをまだステージングしていない場合、Unstagedにのみ表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 0, 2, 0], // 新規ファイル（まだステージングしていない）（headStatus=0, workdirStatus=2, indexStatus=0）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus === 0 なので Staged には表示されない
      expect(result.right.staged).toEqual([]);
      // workdirStatus !== indexStatus なので Unstaged に表示される
      expect(result.right.unstaged).toEqual(['file1.md']);
    }
  });

  it('ステージングを取り消した後は、Stagedから消えてUnstagedに表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 2, 1], // ステージング取り消し後（headStatus=1, workdirStatus=2, indexStatus=1）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus === headStatus なので Staged には表示されない
      expect(result.right.staged).toEqual([]);
      // workdirStatus !== indexStatus なので Unstaged に表示される
      expect(result.right.unstaged).toEqual(['file1.md']);
    }
  });

  it('ステージ済みファイルのみの場合', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 0, 2, 2],
      ['file2.md', 0, 2, 2],
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.staged).toEqual(['file1.md', 'file2.md']);
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('未ステージファイルのみの場合', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 2, 1],
      ['file2.md', 1, 2, 1],
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.staged).toEqual([]);
      expect(result.right.unstaged).toEqual(['file1.md', 'file2.md']);
    }
  });

  it('変更がない場合、空配列を返す', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 0, 0, 0],
      ['file2.md', 1, 1, 1],
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.staged).toEqual([]);
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('空のステータス行列の場合、空配列を返す', () => {
    const statusMatrix: StatusResult = [];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.staged).toEqual([]);
      expect(result.right.unstaged).toEqual([]);
    }
  });

  // カバレッジ100%を目指す追加テストケース

  it('既存ファイルを変更してステージングした場合、Stagedにのみ表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 2, 2], // 既存ファイルを変更してステージング（headStatus=1, workdirStatus=2, indexStatus=2）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus !== 0 && indexStatus !== headStatus なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus === indexStatus なので Unstaged には表示されない
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('既存ファイルを変更してステージング後にさらに編集した場合、StagedとUnstagedの両方に表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 3, 2], // 既存ファイルを変更してステージング後、さらに編集（headStatus=1, workdirStatus=3, indexStatus=2）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus !== 0 && indexStatus !== headStatus なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus !== indexStatus なので Unstaged にも表示される
      expect(result.right.unstaged).toEqual(['file1.md']);
    }
  });

  it('indexStatus === 1 かつ headStatus === 0 の場合（新規ファイルをステージング、HEADと同じ状態）、Stagedにのみ表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 0, 1, 1], // 新規ファイルをステージング、HEADと同じ状態（headStatus=0, workdirStatus=1, indexStatus=1）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus !== 0 && indexStatus !== headStatus なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus === indexStatus なので Unstaged には表示されない
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('indexStatus === 1 かつ headStatus === 1 の場合（変更なし）、どちらにも表示されない', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 1, 1], // 変更なし（headStatus=1, workdirStatus=1, indexStatus=1）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus === headStatus なので Staged には表示されない
      expect(result.right.staged).toEqual([]);
      // workdirStatus === indexStatus なので Unstaged には表示されない
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('workdirStatus === 0 の場合（削除されたファイル）、適切に処理される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 0, 0], // ファイルが削除され、ステージングされている（headStatus=1, workdirStatus=0, indexStatus=0）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // headStatus !== 0 && workdirStatus === 0 && indexStatus === 0 なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus === indexStatus (0 === 0) なので Unstaged には表示されない
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('削除されたファイルが未ステージの場合、Unstagedにのみ表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 0, 1], // ファイルが削除されたが未ステージ（headStatus=1, workdirStatus=0, indexStatus=1）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus === headStatus (1 === 1) なので Staged には表示されない
      expect(result.right.staged).toEqual([]);
      // workdirStatus !== indexStatus (0 !== 1) なので Unstaged に表示される
      expect(result.right.unstaged).toEqual(['file1.md']);
    }
  });

  it('削除されたファイルをステージングした場合、Stagedにのみ表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 0, 0], // 削除をステージング（headStatus=1, workdirStatus=0, indexStatus=0）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // headStatus !== 0 && workdirStatus === 0 && indexStatus === 0 なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus === indexStatus (0 === 0) なので Unstaged には表示されない
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('複数のファイルが混在する場合、正しく分類される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['new-staged.md', 0, 2, 2], // 新規ファイルをステージング
      ['new-unstaged.md', 0, 2, 0], // 新規ファイル（未ステージング）
      ['modified-staged.md', 1, 2, 2], // 既存ファイルを変更してステージング
      ['modified-unstaged.md', 1, 2, 1], // 既存ファイルを変更（未ステージング）
      ['staged-then-modified.md', 1, 3, 2], // ステージング後にさらに変更
      ['unchanged.md', 1, 1, 1], // 変更なし
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.staged).toEqual([
        'new-staged.md',
        'modified-staged.md',
        'staged-then-modified.md',
      ]);
      expect(result.right.unstaged).toEqual([
        'new-unstaged.md',
        'modified-unstaged.md',
        'staged-then-modified.md',
      ]);
    }
  });

  it('indexStatus === 3 の場合（作業ディレクトリともHEADとも異なる）、適切に処理される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 2, 3], // 複雑な状態（headStatus=1, workdirStatus=2, indexStatus=3）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus !== 0 && indexStatus !== headStatus なので Staged に表示される
      expect(result.right.staged).toEqual(['file1.md']);
      // workdirStatus !== indexStatus なので Unstaged にも表示される
      expect(result.right.unstaged).toEqual(['file1.md']);
    }
  });

  it('workdirStatus === 1 かつ indexStatus === 1 の場合（HEADと同じ状態）、どちらにも表示されない', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 1, 1], // HEADと同じ状態（headStatus=1, workdirStatus=1, indexStatus=1）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus === headStatus なので Staged には表示されない
      expect(result.right.staged).toEqual([]);
      // workdirStatus === indexStatus なので Unstaged には表示されない
      expect(result.right.unstaged).toEqual([]);
    }
  });

  it('workdirStatus === 1 かつ indexStatus === 0 の場合（HEADと同じだが未ステージング）、Unstagedに表示される', () => {
    // statusMatrixの順序: [filepath, headStatus, workdirStatus, indexStatus]
    // このケースは実際には発生しない可能性が高いが、ロジックの完全性を確認
    const statusMatrix: StatusResult = [
      ['file1.md', 1, 1, 0], // HEADと同じだが未ステージング（headStatus=1, workdirStatus=1, indexStatus=0）
    ];

    const result = parseGitStatus(statusMatrix);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      // indexStatus === 0 なので Staged には表示されない
      expect(result.right.staged).toEqual([]);
      // workdirStatus !== indexStatus なので Unstaged に表示される
      expect(result.right.unstaged).toEqual(['file1.md']);
    }
  });
});

describe('validateRepository', () => {
  const mockRepository: Repository = {
    id: 'repo-1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  it('リポジトリが存在する場合、Rightを返す', () => {
    const result = validateRepository(mockRepository);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(mockRepository);
      expect(result.right.id).toBe('repo-1');
      expect(result.right.name).toBe('test-repo');
      expect(result.right.full_name).toBe('user/test-repo');
    }
  });

  it('リポジトリがundefinedの場合、REPOSITORY_NOT_FOUNDエラーを返す', () => {
    const result = validateRepository(undefined);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      expect(result.left.message).toBe('Repository is not found');
    }
  });

  it('リポジトリがnullの場合、REPOSITORY_NOT_FOUNDエラーを返す', () => {
    // TypeScriptではnullもfalsyなので、同様にエラーになる
    const result = validateRepository(null as unknown as Repository);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.type).toBe('REPOSITORY_NOT_FOUND');
      expect(result.left.message).toBe('Repository is not found');
    }
  });

  it('異なるリポジトリオブジェクトでも正しく検証される', () => {
    const anotherRepository: Repository = {
      id: 'repo-2',
      name: 'another-repo',
      full_name: 'user/another-repo',
      private: true,
    };

    const result = validateRepository(anotherRepository);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual(anotherRepository);
      expect(result.right.id).toBe('repo-2');
      expect(result.right.private).toBe(true);
    }
  });
});

