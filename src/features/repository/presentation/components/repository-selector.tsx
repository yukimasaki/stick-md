import { Combobox } from '@base-ui-components/react/combobox';
import { useRepository } from '@/features/repository/presentation/hooks/use-repository';
import { Repository } from '@/features/repository/domain/models/repository';
import { ChevronDown } from 'lucide-react';

export function RepositorySelector() {
  const { repositories, selectedRepositoryId, actions } = useRepository();

  const selectedRepo = repositories.find(r => r.id === selectedRepositoryId) || null;

  return (
    <div className="w-full max-w-sm px-4">
      <Combobox.Root<Repository>
        value={selectedRepo ?? undefined}
        onValueChange={(selected) => {
          if (selected) {
            actions.selectRepository(selected.id);
          }
        }}
        itemToStringLabel={(repo) => repo?.full_name ?? ''}
      >
        <div className="relative">
          <Combobox.Input
            className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Select a repository..."
            aria-label="Repository Selection"
          />
           <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50">
             <ChevronDown className="h-4 w-4" />
           </div>
        </div>
      
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Popup className="max-h-60 w-[calc(100%-2rem)] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
               {repositories.length === 0 ? (
                   <div className="p-2 text-sm text-center text-muted-foreground">No repositories found</div>
               ) : (
                 repositories.map((repo) => (
                    <Combobox.Item
                      key={repo.id}
                      value={repo}
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                    >
                      {repo.full_name}
                    </Combobox.Item>
                 ))
               )}
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
