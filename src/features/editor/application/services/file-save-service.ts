import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import type { TabState } from '@/features/editor/domain/models/tab-state';
import type { Repository } from '@/features/repository/domain/models/repository';
import { validateSaveRequest } from '@/features/editor/domain/services/file-save-service';
import { createFile } from '@/features/shared/infra/clients/git-client';
import { tabStore } from '@/features/editor/application/stores/tab-store';
import type { FileSaveError } from '@/features/editor/domain/services/file-save-error';

/**
 * ファイルを保存
 * Application Layer: ファイル保存のユースケースを実装
 * 
 * @param tabState - タブ状態
 * @param repositories - リポジトリ一覧
 * @returns TaskEither<FileSaveError, void> - 保存結果
 */
export function saveFile(
  tabState: TabState,
  repositories: Repository[]
): TE.TaskEither<FileSaveError, void> {
  return pipe(
    // バリデーション
    TE.fromEither(validateSaveRequest(tabState, repositories)),
    // ファイルを保存
    TE.chain(({ tab, repository }) =>
      TE.tryCatch(
        async () => {
          const content = tab.content || '';
          await createFile(repository, tab.filePath, content);
          // 保存成功時はタブを保存済み状態としてマーク
          tabStore.markTabAsSaved(tab.id);
        },
        (error): FileSaveError => {
          if (error instanceof Error && error.message.includes('ENOENT')) {
            return {
              type: 'FILE_NOT_FOUND',
              message: `File not found: ${tab.filePath}`,
              filePath: tab.filePath,
            };
          }
          return {
            type: 'FILE_SYSTEM_ERROR',
            message: `Failed to save file: ${tab.filePath}`,
            filePath: tab.filePath,
          };
        }
      )
    )
  );
}

