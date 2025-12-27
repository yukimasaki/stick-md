import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { FileNameEditDialog } from './file-name-edit-dialog';
import { Repository } from '@/features/repository/domain/models/repository';
import * as fileCreationService from '@/features/repository/application/services/file-creation-service';
import * as errorHandler from '@/features/repository/presentation/utils/error-handler';
import * as E from 'fp-ts/Either';
import type { FileCreationError } from '@/features/repository/domain/services/file-creation-error';

// モック
vi.mock('@/features/repository/application/services/file-creation-service');
vi.mock('@/features/repository/presentation/utils/error-handler');
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('FileNameEditDialog', () => {
  const mockRepository: Repository = {
    id: '1',
    name: 'test-repo',
    full_name: 'user/test-repo',
    private: false,
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    repository: mockRepository,
    directoryPath: '',
    onFileCreated: vi.fn(),
  };

  describe('ダイアログの表示', () => {
    it('openがtrueの場合、ダイアログが表示される', () => {
      render(<FileNameEditDialog {...defaultProps} />);
      
      expect(screen.getByText('Create New Markdown File')).toBeDefined();
    });

    it('openがfalseの場合、ダイアログが表示されない', () => {
      render(<FileNameEditDialog {...defaultProps} open={false} />);
      
      expect(screen.queryByText('Create New Markdown File')).toBeNull();
    });

    it('ダイアログが開いたとき、ファイル名が空で初期化される', () => {
      render(<FileNameEditDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      expect(input.value).toBe('');
      expect(screen.getByText('.md')).toBeDefined();
    });
  });

  describe('ファイル名の入力', () => {
    it('ファイル名を入力できる', () => {
      render(<FileNameEditDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(input.value).toBe('test');
      expect(screen.getByText('.md')).toBeDefined();
    });

    it('ファイル名が空の場合、作成ボタンが無効化される', () => {
      render(<FileNameEditDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '   ' } });
      
      const createButton = screen.getByText('Create') as HTMLButtonElement;
      expect(createButton.disabled).toBe(true);
    });
  });

  describe('ファイル作成', () => {
    it('作成ボタンをクリックするとcreateMarkdownFileが呼ばれる', async () => {
      vi.mocked(fileCreationService.createMarkdownFile).mockResolvedValue(
        E.right('test.md')
      );

      render(<FileNameEditDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(fileCreationService.createMarkdownFile).toHaveBeenCalledWith(
          mockRepository,
          '',
          'test.md'
        );
      });
    });

    it('ファイル作成に成功するとonFileCreatedが呼ばれ、ダイアログが閉じる', async () => {
      const onFileCreated = vi.fn();
      const onOpenChange = vi.fn();
      
      vi.mocked(fileCreationService.createMarkdownFile).mockResolvedValue(
        E.right('test.md')
      );

      render(
        <FileNameEditDialog
          {...defaultProps}
          onFileCreated={onFileCreated}
          onOpenChange={onOpenChange}
        />
      );
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(onFileCreated).toHaveBeenCalledWith('test.md');
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('ファイル作成に失敗するとエラーハンドラーが呼ばれる', async () => {
      const error = {
        type: 'VALIDATION_ERROR' as const,
        message: 'Invalid file name',
      };
      
      vi.mocked(fileCreationService.createMarkdownFile).mockResolvedValue(
        E.left(error)
      );

      render(<FileNameEditDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(errorHandler.handleFileCreationError).toHaveBeenCalledWith(error);
      });
    });

    it('ファイル作成中は作成ボタンが「Creating...」と表示され、無効化される', async () => {
      let resolvePromise: (value: E.Either<FileCreationError, string>) => void;
      const promise = new Promise<E.Either<FileCreationError, string>>((resolve) => {
        resolvePromise = resolve;
      });
      
      vi.mocked(fileCreationService.createMarkdownFile).mockReturnValue(promise);

      render(<FileNameEditDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        const creatingButton = screen.getByText('Creating...') as HTMLButtonElement;
        expect(creatingButton).toBeDefined();
        expect(creatingButton.disabled).toBe(true);
      });

      // プロミスを解決
      resolvePromise!({
        _tag: 'Right',
        right: 'test.md',
      });
    });
  });

  describe('キャンセル', () => {
    it('キャンセルボタンをクリックするとonOpenChangeがfalseで呼ばれる', () => {
      const onOpenChange = vi.fn();
      render(<FileNameEditDialog {...defaultProps} onOpenChange={onOpenChange} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('Escapeキーを押すとダイアログが閉じる', () => {
      const onOpenChange = vi.fn();
      render(<FileNameEditDialog {...defaultProps} onOpenChange={onOpenChange} />);
      
      const input = screen.getByPlaceholderText('Enter file name');
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('キーボードショートカット', () => {
    it('Enterキーを押すとファイル作成が実行される', async () => {
      vi.mocked(fileCreationService.createMarkdownFile).mockResolvedValue(
        E.right('test.md')
      );

      render(<FileNameEditDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(fileCreationService.createMarkdownFile).toHaveBeenCalled();
      });
    });

    it('Shift+Enterキーではファイル作成が実行されない', async () => {
      render(<FileNameEditDialog {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Enter file name');
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

      await waitFor(() => {
        expect(fileCreationService.createMarkdownFile).not.toHaveBeenCalled();
      });
    });
  });

  describe('directoryPathの処理', () => {
    it('directoryPathが指定されている場合、createMarkdownFileに渡される', async () => {
      vi.mocked(fileCreationService.createMarkdownFile).mockResolvedValue(
        E.right('src/test.md')
      );

      render(
        <FileNameEditDialog
          {...defaultProps}
          directoryPath="src"
        />
      );
      
      const input = screen.getByPlaceholderText('Enter file name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });
      
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(fileCreationService.createMarkdownFile).toHaveBeenCalledWith(
          mockRepository,
          'src',
          'test.md'
        );
      });
    });
  });
});

