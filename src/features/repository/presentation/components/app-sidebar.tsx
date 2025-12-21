'use client';

import { LogOut, User, Folder, Github } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExplorerContent } from "@/features/repository/presentation/components/explorer-content"
import { RepositoryContent } from "@/features/repository/presentation/components/repository-content"
import { logout } from "@/app/_actions/auth"
import type { Session } from "next-auth"

interface AppSidebarProps {
  session: Session | null
}

export function AppSidebar({ session }: AppSidebarProps) {
  return (
    <Sidebar side="left" collapsible="offcanvas">
      <SidebarContent>
        <Tabs defaultValue="explorer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-2">
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span>Explorer</span>
            </TabsTrigger>
            <TabsTrigger value="repository" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span>Repository</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explorer" className="mt-0">
            <ExplorerContent />
          </TabsContent>

          <TabsContent value="repository" className="mt-0">
            <RepositoryContent session={session} />
          </TabsContent>
        </Tabs>
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

