'use client';

import { Save, Github } from "lucide-react"
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

export function AppSidebar() {
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

              {/* GitHub Integration */}
              <SidebarMenuItem>
                 <SidebarMenuButton asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Github />
                    <span>GitHub Integration</span>
                  </a>
                 </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-4 my-2 border-t" />

        <SidebarGroup>
          <SidebarGroupLabel>Repository</SidebarGroupLabel>
          <SidebarGroupContent>
             <div className="px-2 py-2">
                <RepositorySelector />
             </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
         <div className="text-xs text-muted-foreground p-4">
            Stick-MD v0.1.0
         </div>
      </SidebarFooter>
    </Sidebar>
  )
}
