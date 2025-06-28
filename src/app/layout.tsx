import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Justificativa - Grupo Britto',
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
