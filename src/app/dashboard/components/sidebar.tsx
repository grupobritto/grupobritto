'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { LayoutDashboard, Settings, User, CreditCard, BookMarked, Gavel } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/processo', label: 'Processos', icon: Gavel },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User, disabled: true },
  { href: '/dashboard/pagamentos', label: 'Pagamentos', icon: CreditCard, disabled: true },
  { href: '/dashboard/docs', label: 'Documentação', icon: BookMarked, disabled: true },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'text-card-foreground flex w-64 flex-col bg-(--color-background-menus)',
        className,
      )}
    >
      <div className="p-6">
        <Link href="/dashboard">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="Picture of the author"
              className="rounded"
            />
            <h1 className="text-3xl font-bold uppercase">JusCheck</h1>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                item.disabled && 'cursor-not-allowed opacity-50',
              )}
              aria-disabled={item.disabled}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4">
        <p className="text-muted-foreground text-sm">© 2025 JusCheck</p>
      </div>
    </aside>
  );
}
