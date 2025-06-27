import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Treino - Grupo Britto',
  description:
    'Página destinada aos projetos desenvolvidos pelo Grupo Britto e Associados. O conteúdo aqui disponibilizado deve ser utilizado com a devida cautela e responsabilidade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
