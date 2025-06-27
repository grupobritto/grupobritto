'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OpcaoFiltro {
  value: string;
  label: string;
  Icon: React.ElementType;
}

interface FiltroMovimentosProps {
  value: string;
  onValueChange: (value: string) => void;
  opcoes: OpcaoFiltro[];
}

export function FiltroMovimentos({ value, onValueChange, opcoes }: FiltroMovimentosProps) {
  const [open, setOpen] = React.useState(false);
  const listboxId = React.useId();

  const todasAsOpcoes = [{ value: '', label: 'Todos os Movimentos', Icon: LayoutList }, ...opcoes];
  const selectedOption = todasAsOpcoes.find((opcao) => opcao.value === value);

  return (
    <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
      <div className="w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--color-borda)] bg-[var(--color-background-menus)] px-3 py-2 text-sm transition-colors hover:bg-[var(--color-background-hover)] sm:w-[250px]"
        >
          <div className="flex items-center truncate">
            {selectedOption ? (
              <selectedOption.Icon className="mr-2 h-4 w-4" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {selectedOption ? selectedOption.label : 'Filtrar por tipo de evento...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
        {open && (
          <div className="relative">
            <div className="absolute top-2 z-20 w-full sm:w-[250px]" id={listboxId} role="listbox">
              <div className="rounded-md border border-[var(--color-borda)] bg-[var(--color-background-menus)] p-1 text-[var(--color-textos-icones)] shadow-lg">
                {todasAsOpcoes.map((opcao) => (
                  <div
                    key={opcao.value}
                    role="option"
                    aria-selected={value === opcao.value}
                    onClick={() => {
                      onValueChange(opcao.value === value ? '' : opcao.value);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center rounded-sm p-2 text-sm hover:bg-[var(--color-background-hover)]"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === opcao.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <opcao.Icon className="mr-2 h-4 w-4" />
                    {opcao.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative w-full flex-grow">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-texto-muted)]" />
        <input
          placeholder="Ou digite qualquer termo para buscar..."
          className="h-10 w-full rounded-md border border-[var(--color-borda)] bg-[var(--color-background-menus)] px-3 py-2 pl-10 text-sm placeholder:text-[var(--color-texto-muted)] focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] focus-visible:outline-none"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        />
      </div>
    </div>
  );
}
