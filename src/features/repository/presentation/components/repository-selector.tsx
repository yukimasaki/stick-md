'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { Repository } from '@/features/repository/domain/models/repository';
import { ChevronDown, Check, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cloneRepositoryUseCase } from '@/features/repository/application/services/clone-service';

interface RepositorySelectorProps {
  accessToken?: string;
}

export function RepositorySelector({ accessToken }: RepositorySelectorProps) {
  const { repositories, selectedRepositoryId, isLoading, actions } = useRepository();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [debouncedSearchValue] = useDebounce(inputValue, 300);
  const [error, setError] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // リポジトリ一覧の取得はRepositoryProviderで行われるため、ここでは不要

  const selectedRepo = repositories.find(r => r.id === selectedRepositoryId) || null;

  // IME入力中は検索を実行しない
  const searchValue = isComposing ? '' : debouncedSearchValue;

  // 検索フィルタリング
  const filteredRepositories = useMemo(() => {
    if (!searchValue) return repositories;
    const lowerSearch = searchValue.toLowerCase();
    return repositories.filter(repo => 
      repo.full_name.toLowerCase().includes(lowerSearch) ||
      repo.name.toLowerCase().includes(lowerSearch)
    );
  }, [repositories, searchValue]);

  // 外部クリック検出
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredRepositories.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredRepositories.length) {
            handleSelect(filteredRepositories[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('keydown', handleKeyDown);
      return () => {
        input.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, highlightedIndex, filteredRepositories]);

  // ハイライトされたアイテムをスクロール表示
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (repo: Repository) => {
    actions.selectRepository(repo.id);
    setOpen(false);
    setInputValue('');
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputValue) {
      // 入力値がある場合はクリア
      setInputValue('');
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    } else if (selectedRepo) {
      // 選択されたリポジトリがある場合は選択を解除
      actions.selectRepository(null);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setHighlightedIndex(-1);
    if (!open) setOpen(true);
  };

  const handleInputFocus = () => {
    setOpen(true);
    // フォーカス時は選択されたリポジトリ名を表示し続ける
    // ユーザーが入力を開始したら自動的にinputValueが設定される
  };

  const handleInputClick = () => {
    if (!open) setOpen(true);
  };

  // 表示用の値: 入力値がある場合は入力値を表示、それ以外は選択されたリポジトリ名を表示
  const displayValue = inputValue || selectedRepo?.full_name || '';

  const handleClone = async () => {
    if (!selectedRepo || !accessToken) {
      setCloneError('Repository or access token is missing');
      return;
    }

    setIsCloning(true);
    setCloneError(null);

    try {
      await cloneRepositoryUseCase(selectedRepo, accessToken);
      // クローン完了後にファイルツリーを更新するためのイベントを発火
      window.dispatchEvent(new CustomEvent('repository-cloned', { 
        detail: { repositoryId: selectedRepo.id } 
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clone repository';
      setCloneError(errorMessage);
      console.error('Failed to clone repository:', err);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="w-full px-2" ref={containerRef}>
      {/* コンボボックス */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className={cn(
              "w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "pr-10 truncate"
            )}
            placeholder="Search or select a repository..."
            aria-label="Repository Selection"
            aria-expanded={open}
            aria-haspopup="listbox"
            role="combobox"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputValue || selectedRepo ? (
              <button
                type="button"
                onClick={handleClear}
                className="opacity-50 hover:opacity-100 transition-opacity"
                aria-label={inputValue ? "Clear search" : "Clear selection"}
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <ChevronDown className={cn(
                "h-4 w-4 opacity-50 transition-transform",
                open && "rotate-180"
              )} />
            )}
          </div>
        </div>

        {/* ドロップダウンメニュー */}
        {open && (
          <div
            ref={listRef}
            className={cn(
              "absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
              "animate-in fade-in-0 zoom-in-95"
            )}
            role="listbox"
          >
            {isLoading ? (
              <div className="p-2 text-sm text-center text-muted-foreground">
                Loading repositories...
              </div>
            ) : error ? (
              <div className="p-2 text-sm text-center text-destructive">
                {error}
              </div>
            ) : filteredRepositories.length === 0 ? (
              <div className="p-2 text-sm text-center text-muted-foreground">
                No repositories found
              </div>
            ) : (
              filteredRepositories.map((repo, index) => (
                <div
                  key={repo.id}
                  role="option"
                  aria-selected={selectedRepositoryId === repo.id}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground",
                    selectedRepositoryId === repo.id && "bg-accent text-accent-foreground",
                    highlightedIndex === index && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(repo)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {selectedRepositoryId === repo.id && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{repo.full_name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Clone Button */}
      {selectedRepo && (
        <div className="mt-3 px-2">
          <Button
            onClick={handleClone}
            disabled={isCloning || !accessToken}
            className="w-full"
            size="sm"
          >
            {isCloning ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Clone
              </>
            )}
          </Button>
          {cloneError && (
            <div className="mt-2 text-xs text-destructive text-center">
              {cloneError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
