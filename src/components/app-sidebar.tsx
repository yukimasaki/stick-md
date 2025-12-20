'use client';

import { Save, Github, LogOut, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { RepositorySelector } from "@/features/repository/presentation/components/repository-selector"
import { login, logout } from "@/app/_actions/auth"
import type { Session } from "next-auth"

interface AppSidebarProps {
  session: Session | null
}

export function AppSidebar({ session }: AppSidebarProps) {
  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarContent>
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
      </SidebarContent>
      
      <SidebarFooter>
         {session ? (
            <div className="p-2 border-t mt-auto">
                <div className="flex items-center gap-2 mb-2 px-2">
                    {session.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-6 h-6 rounded-full" />
                    ) : (
                        <User className="w-6 h-6" />
                    )}
                    <span className="text-sm font-medium truncate">{session.user?.name}</span>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <button onClick={() => logout()} className="text-red-500 hover:text-red-600">
                                <LogOut />
                                <span>Sign out</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>
         ) : (
            <div className="text-xs text-muted-foreground p-4">
                Stick-MD v0.1.0
            </div>
         )}
      </SidebarFooter>
    </Sidebar>
  )
}
