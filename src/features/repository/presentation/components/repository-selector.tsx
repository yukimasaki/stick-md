'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { Repository } from '@/features/repository/domain/models/repository';
import { ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getUserRepositories } from '@/app/_actions/repository';

export function RepositorySelector() {
  const { repositories, selectedRepositoryId, isLoading, actions } = useRepository();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // コンポーネントマウント時にリポジトリ一覧を取得
  // useEffectは外部システム（GitHub API）との同期に使用
  useEffect(() => {
    const fetchRepositories = async () => {
      // 既にリポジトリが取得済み、または既に取得処理を実行済みの場合はスキップ
      if (repositories.length > 0 || hasFetchedRef.current) {
        return;
      }

      hasFetchedRef.current = true;

      try {
        actions.setLoading(true);
        setError(null);
        const repos = await getUserRepositories();
        actions.setRepositories(repos);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories';
        setError(errorMessage);
        console.error('Failed to fetch repositories:', err);
        hasFetchedRef.current = false; // エラー時は再試行可能にする
      } finally {
        actions.setLoading(false);
      }
    };

    fetchRepositories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回マウント時のみ実行

  const selectedRepo = repositories.find(r => r.id === selectedRepositoryId) || null;

  // 検索フィルタリング
  const filteredRepositories = useMemo(() => {
    if (!searchValue) return repositories;
    const lowerSearch = searchValue.toLowerCase();
    return repositories.filter(repo => 
      repo.full_name.toLowerCase().includes(lowerSearch) ||
      repo.name.toLowerCase().includes(lowerSearch)
    );
  }, [repositories, searchValue]);

  const handleSelect = (repo: Repository) => {
    actions.selectRepository(repo.id);
    setOpen(false);
    setSearchValue('');
  };

  return (
    <div className="w-full px-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <Input
              className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 truncate"
              placeholder="Select a repository..."
              aria-label="Repository Selection"
              value={searchValue || selectedRepo?.full_name || ''}
              onChange={(e) => {
                setSearchValue(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-auto"
          align="start"
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
            filteredRepositories.map((repo) => (
              <DropdownMenuItem
                key={repo.id}
                onSelect={() => handleSelect(repo)}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                  "focus:bg-accent focus:text-accent-foreground",
                  selectedRepositoryId === repo.id && "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {selectedRepositoryId === repo.id && (
                    <Check className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="truncate">{repo.full_name}</span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
