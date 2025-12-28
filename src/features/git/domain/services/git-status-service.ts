import * as E from 'fp-ts/Either';
import type { StatusResult } from '@/features/shared/infra/clients/git-client';
import { Repository } from '@/features/repository/domain/models/repository';
import type { GitStatusError } from './git-status-error';

/**
 * Gitステータスをパースしてステージ済みと未ステージファイルを分離
 * Domain Layer: 純粋関数（TDDで実装）
 * 
 * statusMatrixの形式: [filepath, headStatus, workdirStatus, indexStatus]
 * isomorphic-gitのstatusMatrixの実際の順序に注意
 * - headStatus: HEADの状態（0=存在しない, 1=存在する）
 * - workdirStatus: 作業ディレクトリの状態（0=存在しない, 1=HEADと同じ, 2=HEADと異なる）
 * - indexStatus: インデックス（ステージングエリア）の状態（0=存在しない, 1=HEADと同じ, 2=作業ディレクトリと同じ, 3=作業ディレクトリともHEADとも異なる）
 * 
 * ステージ済み:
 *   - 通常の変更: indexStatus !== 0 かつ indexStatus !== headStatus
 *   - 削除されたファイル: headStatus !== 0 && workdirStatus === 0 && indexStatus === 0
 * 未ステージ: workdirStatus !== indexStatus
 */
export function parseGitStatus(
  statusMatrix: StatusResult
): E.Either<GitStatusError, { staged: string[]; unstaged: string[] }> {
  const staged: string[] = [];
  const unstaged: string[] = [];

  for (const [filepath, headStatus, workdirStatus, indexStatus] of statusMatrix) {
    // ステージ済み: インデックスが存在し、HEADと異なる（ステージングされている）
    // または削除されたファイルがステージングされている場合
    // 削除されたファイルをステージングした場合: headStatus !== 0 && workdirStatus === 0 && indexStatus === 0
    const isStagedNormal = indexStatus !== 0 && indexStatus !== headStatus;
    const isStagedDeleted = headStatus !== 0 && workdirStatus === 0 && indexStatus === 0;
    const isStaged = isStagedNormal || isStagedDeleted;
    
    // 未ステージ: 作業ディレクトリがインデックスと異なる（変更があるがステージングされていない、またはステージング後にさらに変更された）
    // 削除されたファイルが未ステージの場合: headStatus !== 0 && workdirStatus === 0 && indexStatus !== 0
    const isUnstaged = workdirStatus !== indexStatus;
    
    if (isStaged) {
      staged.push(filepath);
    }
    if (isUnstaged) {
      unstaged.push(filepath);
    }
  }

  return E.right({ staged, unstaged });
}

/**
 * リポジトリの存在を検証
 * Domain Layer: 純粋関数（TDDで実装）
 */
export function validateRepository(
  repository: Repository | undefined
): E.Either<GitStatusError, Repository> {
  if (!repository) {
    return E.left({
      type: 'REPOSITORY_NOT_FOUND',
      message: 'Repository is not found',
    });
  }

  return E.right(repository);
}

