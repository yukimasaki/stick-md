'use client';

import { RepositorySelector } from "@/features/repository/presentation/components/repository-selector"
import { GitStatusUI } from "@/features/git/presentation/components/git-status-ui"
import { CommitForm } from "@/features/git/presentation/components/commit-form"
import { CommitHistory } from "@/features/git/presentation/components/commit-history"
import type { Session } from "next-auth"

interface RepositoryContentProps {
  session: Session | null
}

export function RepositoryContent({ session }: RepositoryContentProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      {/* Repository Section */}
      <div className="flex flex-col gap-1">
        <div className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground">
          Repository
        </div>
        <div className="px-2 py-2">
          {session ? (
            <RepositorySelector accessToken={session.accessToken as string | undefined} />
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">
              Please sign in to select a repository.
            </div>
          )}
        </div>
      </div>

      {/* Code Management Section */}
      {session && (
        <>
          <div className="mx-4 my-2 border-t border-sidebar-border" />
          
          <CommitForm />
          
          <GitStatusUI />
          
          <div className="mx-4 my-2 border-t border-sidebar-border" />
          
          <CommitHistory />
        </>
      )}
    </div>
  );
}

