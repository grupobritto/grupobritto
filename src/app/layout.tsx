import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/provider';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Faculdade - Grupo Britto',
  description:
    'Página destinada aos projetos desenvolvidos pelo Grupo Britto e Associados. O conteúdo aqui disponibilizado deve ser utilizado com a devida cautela e responsabilidade.',
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const defaultOpen = (await cookieStore).get('sidebar_state')?.value === 'true';

  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <main className="flex flex-1 items-center justify-center">{children}</main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
