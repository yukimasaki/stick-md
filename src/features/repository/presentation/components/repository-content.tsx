'use client';

import { Save, Github } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { RepositorySelector } from "@/features/repository/presentation/components/repository-selector"
import { login } from "@/app/_actions/auth"
import type { Session } from "next-auth"

interface RepositoryContentProps {
  session: Session | null
}

export function RepositoryContent({ session }: RepositoryContentProps) {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* Save */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button onClick={() => console.log('Save triggered')}>
                  <Save />
                  <span>Save</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* GitHub Integration / Auth */}
            {session ? (
               <>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button onClick={() => console.log('Sync triggered')}>
                      <Github />
                      <span>Sync with GitHub</span>
                    </button>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
               </>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => login()}>
                    <Github />
                    <span>Sign in with GitHub</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mx-4 my-2 border-t" />

      <SidebarGroup>
        <SidebarGroupLabel>Repository</SidebarGroupLabel>
        <SidebarGroupContent>
           <div className="px-2 py-2">
              {session ? (
                  <RepositorySelector accessToken={session.accessToken as string | undefined} />
              ) : (
                  <div className="text-xs text-muted-foreground text-center py-4">
                      Please sign in to select a repository.
                  </div>
              )}
           </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

