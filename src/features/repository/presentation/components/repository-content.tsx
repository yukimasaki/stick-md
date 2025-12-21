'use client';

import { Save, Github } from "lucide-react"
import { RepositorySelector } from "@/features/repository/presentation/components/repository-selector"
import { login } from "@/app/_actions/auth"
import { cn } from "@/lib/utils"
import type { Session } from "next-auth"

interface RepositoryContentProps {
  session: Session | null
}

export function RepositoryContent({ session }: RepositoryContentProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      {/* Menu Section */}
      <div className="flex flex-col gap-1">
        <div className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground">
          Menu
        </div>
        <ul className="flex w-full min-w-0 flex-col gap-1">
          {/* Save */}
          <li>
            <button
              onClick={() => console.log('Save triggered')}
              className={cn(
                "flex w-full items-center gap-2 rounded-md p-2 text-sm text-left",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "transition-colors"
              )}
            >
              <Save className="h-4 w-4 shrink-0" />
              <span>Save</span>
            </button>
          </li>

          {/* GitHub Integration / Auth */}
          {session ? (
            <li>
              <button
                onClick={() => console.log('Sync triggered')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md p-2 text-sm text-left",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "transition-colors"
                )}
              >
                <Github className="h-4 w-4 shrink-0" />
                <span>Sync with GitHub</span>
              </button>
            </li>
          ) : (
            <li>
              <button
                onClick={() => login()}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md p-2 text-sm text-left",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "transition-colors"
                )}
              >
                <Github className="h-4 w-4 shrink-0" />
                <span>Sign in with GitHub</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      <div className="mx-4 my-2 border-t border-sidebar-border" />

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
    </div>
  );
}

