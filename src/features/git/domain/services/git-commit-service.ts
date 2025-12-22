import * as E from 'fp-ts/Either';
import type { GitCommitError } from './git-commit-error';

/**
 * コミットメッセージを検証
 * Domain Layer: 純粋関数（TDDで実装）
 */
export function validateCommitMessage(
  message: string
): E.Either<GitCommitError, string> {
  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    return E.left({
      type: 'EMPTY_COMMIT_MESSAGE',
      message: 'Commit message cannot be empty',
    });
  }

  return E.right(trimmedMessage);
}

/**
 * ステージ済みファイルの存在を検証
 * Domain Layer: 純粋関数（TDDで実装）
 */
export function validateStagedFiles(
  stagedFiles: string[]
): E.Either<GitCommitError, string[]> {
  if (stagedFiles.length === 0) {
    return E.left({
      type: 'NO_STAGED_FILES',
      message: 'No staged files to commit',
    });
  }

  return E.right(stagedFiles);
}

