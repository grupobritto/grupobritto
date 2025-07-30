import { Calendar, ChevronDown, Home, Inbox, Search, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

// Menu items.
const calculadoras = [
  {
    title: 'Trabalhistas',
    url: '/calculadora/trabalhista',
    icon: Home,
  },
  {
    title: 'Previdenciária',
    url: '/calculadora/previdenciaria',
    icon: Inbox,
  },
  {
    title: 'Cíveis',
    url: '/calculadora/civeis',
    icon: Calendar,
  },
  {
    title: 'Juros e Atualização Monetária',
    url: '/calculadora/juros',
    icon: Search,
  },
  {
    title: 'Tributárias',
    url: '/calculadora/tributarias',
    icon: Settings,
  },
  {
    title: 'Processuais',
    url: '/calculadora/processuais',
    icon: Settings,
  },
];
const processos = [
  {
    title: 'Procurar',
    url: '#',
    icon: Search,
  },
  {
    title: 'Inbox',
    url: '#',
    icon: Inbox,
  },
];

export function AppSidebar() {
  return (
    <>
      <SidebarTrigger />
      <Sidebar className="border-none">
        <SidebarContent className="bg-(--color-background-menus)">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Calculadoras
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenu>
                  {calculadoras.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Processos
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenu>
                  {processos.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
