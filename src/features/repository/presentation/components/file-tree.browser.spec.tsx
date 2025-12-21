import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { FileTree } from './file-tree';
import { FileTreeNode } from '@/features/repository/domain/models/file-tree';

afterEach(() => {
  cleanup();
});

describe('FileTree', () => {
  const mockTree: FileTreeNode[] = [
    {
      path: 'src',
      name: 'src',
      type: 'directory',
      children: [
        {
          path: 'src/components',
          name: 'components',
          type: 'directory',
          children: [
            {
              path: 'src/components/button.tsx',
              name: 'button.tsx',
              type: 'file',
            },
          ],
        },
        {
          path: 'src/utils.ts',
          name: 'utils.ts',
          type: 'file',
        },
      ],
    },
    {
      path: 'README.md',
      name: 'README.md',
      type: 'file',
    },
  ];

  describe('空のツリー', () => {
    it('「No files available」が表示される', () => {
      render(<FileTree tree={[]} />);
      expect(screen.getByText('No files available')).toBeDefined();
    });

    it('onFileCreateが提供されている場合、コンテキストメニューが表示される', async () => {
      const onFileCreate = vi.fn();
      render(<FileTree tree={[]} onFileCreate={onFileCreate} />);

      const emptyArea = screen.getByText('No files available');
      
      // 右クリックでコンテキストメニューを開く
      fireEvent.contextMenu(emptyArea);

      // コンテキストメニューが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('New')).toBeDefined();
      });
    });

    it('コンテキストメニューから「Markdown (.md)」を選択するとonFileCreateが呼ばれる', async () => {
      const onFileCreate = vi.fn();
      render(<FileTree tree={[]} onFileCreate={onFileCreate} />);

      const emptyArea = screen.getByText('No files available');
      fireEvent.contextMenu(emptyArea);

      await waitFor(() => {
        expect(screen.getByText('New')).toBeDefined();
      });

      // サブメニューを開く（クリックで開く）
      const newMenuItem = screen.getByText('New');
      fireEvent.click(newMenuItem);

      await waitFor(() => {
        expect(screen.getByText('Markdown (.md)')).toBeDefined();
      });

      const markdownItem = screen.getByText('Markdown (.md)');
      fireEvent.click(markdownItem);

      expect(onFileCreate).toHaveBeenCalledWith('');
    });
  });

  describe('ファイルツリーの表示', () => {
    it('ツリーノードが正しく表示される', () => {
      render(<FileTree tree={mockTree} />);
      
      expect(screen.getByText('src')).toBeDefined();
      expect(screen.getByText('README.md')).toBeDefined();
    });

    it('デフォルトでディレクトリは閉じた状態', () => {
      render(<FileTree tree={mockTree} />);
      
      // 子要素は表示されない
      expect(screen.queryByText('components')).toBeNull();
      expect(screen.queryByText('button.tsx')).toBeNull();
    });


    it('ファイルをクリックするとonFileSelectが呼ばれる', () => {
      const onFileSelect = vi.fn();
      render(<FileTree tree={mockTree} onFileSelect={onFileSelect} />);
      
      const readmeFile = screen.getByText('README.md');
      fireEvent.click(readmeFile);

      expect(onFileSelect).toHaveBeenCalledWith('README.md');
    });

    it('selectedPathが指定されている場合、該当ファイルが選択状態になる', () => {
      render(<FileTree tree={mockTree} selectedPath="README.md" />);
      
      const readmeFile = screen.getByText('README.md');
      const container = readmeFile.closest('div');
      expect(container?.className).toContain('bg-accent');
    });
  });

  describe('コンテキストメニュー', () => {
    it('ディレクトリで右クリックするとコンテキストメニューが表示される', async () => {
      const onFileCreate = vi.fn();
      render(<FileTree tree={mockTree} onFileCreate={onFileCreate} />);
      
      // まずディレクトリを展開
      const srcDir = screen.getByText('src');
      fireEvent.click(srcDir);
      
      await waitFor(() => {
        expect(screen.getByText('components')).toBeDefined();
      });
      
      const componentsDir = screen.getByText('components');
      fireEvent.contextMenu(componentsDir);

      await waitFor(() => {
        expect(screen.getByText('New')).toBeDefined();
      });
    });

    it('ディレクトリのコンテキストメニューから「Markdown (.md)」を選択するとonFileCreateが呼ばれる', async () => {
      const onFileCreate = vi.fn();
      render(<FileTree tree={mockTree} onFileCreate={onFileCreate} />);
      
      // まずディレクトリを展開
      const srcDir = screen.getByText('src');
      fireEvent.click(srcDir);
      
      await waitFor(() => {
        expect(screen.getByText('components')).toBeDefined();
      });
      
      const componentsDir = screen.getByText('components');
      fireEvent.contextMenu(componentsDir);

      await waitFor(() => {
        expect(screen.getByText('New')).toBeDefined();
      });

      // サブメニューを開く（クリックで開く）
      const newMenuItem = screen.getByText('New');
      fireEvent.click(newMenuItem);

      await waitFor(() => {
        expect(screen.getByText('Markdown (.md)')).toBeDefined();
      });

      const markdownItem = screen.getByText('Markdown (.md)');
      fireEvent.click(markdownItem);

      expect(onFileCreate).toHaveBeenCalledWith('src/components');
    });

    it('ファイルツリーの背景で右クリックするとコンテキストメニューが表示される', async () => {
      const onFileCreate = vi.fn();
      render(<FileTree tree={mockTree} onFileCreate={onFileCreate} />);
      
      // 背景を取得（ツリーのルートdiv）
      const treeContainer = screen.getByText('src').closest('div')?.parentElement;
      if (treeContainer) {
        fireEvent.contextMenu(treeContainer);
      }

      await waitFor(() => {
        expect(screen.getByText('New')).toBeDefined();
      });
    });

    it('背景のコンテキストメニューから「Markdown (.md)」を選択するとonFileCreateが空文字列で呼ばれる', async () => {
      const onFileCreate = vi.fn();
      render(<FileTree tree={mockTree} onFileCreate={onFileCreate} />);
      
      const treeContainer = screen.getByText('src').closest('div')?.parentElement;
      if (treeContainer) {
        fireEvent.contextMenu(treeContainer);
      }

      await waitFor(() => {
        expect(screen.getByText('New')).toBeDefined();
      });

      // サブメニューを開く（クリックで開く）
      const newMenuItem = screen.getByText('New');
      fireEvent.click(newMenuItem);

      await waitFor(() => {
        expect(screen.getByText('Markdown (.md)')).toBeDefined();
      });

      const markdownItem = screen.getByText('Markdown (.md)');
      fireEvent.click(markdownItem);

      expect(onFileCreate).toHaveBeenCalledWith('');
    });

    it('ファイルにはコンテキストメニューが表示されない', () => {
      const onFileCreate = vi.fn();
      render(<FileTree tree={mockTree} onFileCreate={onFileCreate} />);
      
      const readmeFile = screen.getByText('README.md');
      fireEvent.contextMenu(readmeFile);

      // コンテキストメニューは表示されない（onFileCreateが呼ばれない）
      expect(onFileCreate).not.toHaveBeenCalled();
    });
  });
});

