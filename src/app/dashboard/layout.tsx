'use client';

import { Sidebar } from './components/sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Fecha a sidebar ao navegar para uma nova página no mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Efeito para registrar o Service Worker (se aplicável)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => console.log('Service Worker registrado com sucesso:', registration.scope),
        (err) => console.error('Falha ao registrar Service Worker:', err),
      );
    }
  }, []);

  return (
    <div className="bg-muted/40 flex min-h-screen">
      {/* --- Sidebar para Desktop --- */}
      {/* Fica sempre visível em telas médias e maiores */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* --- Sidebar para Mobile (controlada por estado) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Overlay que fecha o menu ao clicar */}
          <div
            className="fixed inset-0 bg-black/60"
            aria-hidden="true"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Conteúdo da Sidebar */}
          <Sidebar className="z-10 flex" />
        </div>
      )}

      {/* --- Conteúdo Principal --- */}
      <main className="flex w-full flex-1 flex-col">
        {/* Header para Mobile (agora vive no layout) */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-(--color-background-geral) p-4 md:hidden">
          <Link href="/dashboard">
            <h1 className="bg-gradient-to-r from-[#EE2026] via-[#FFFFFF] to-[#A7CF3B] bg-clip-text text-4xl font-bold tracking-widest text-transparent uppercase">
              JusCheck
            </h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Abrir ou fechar menu"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* O conteúdo da página atual é renderizado aqui */}
        <div className="flex-1 p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
