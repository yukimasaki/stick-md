'use client';

import { GitStatusUI } from "@/features/git/presentation/components/git-status-ui"
import { CommitForm } from "@/features/git/presentation/components/commit-form"
import { CommitHistory } from "@/features/git/presentation/components/commit-history"
import { useTranslations } from "next-intl"
import type { Session } from "next-auth"

interface RepositoryContentProps {
  session: Session | null
}

export function RepositoryContent({ session }: RepositoryContentProps) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-2 p-2">
      {/* Code Management Section */}
      {session && (
        <>
          <CommitForm session={session} />
          
          <GitStatusUI />
          
          <div className="mx-4 my-2 border-t border-sidebar-border" />
          
          <CommitHistory />
        </>
      )}
      {!session && (
        <div className="text-xs text-muted-foreground text-center py-4">
          {t('git.signInRequired')}
        </div>
      )}
    </div>
  );
}

