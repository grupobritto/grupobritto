import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarNumeroProcesso(numero: string): string {
  const somenteDigitos = numero.replace(/\D/g, '');
  if (somenteDigitos.length !== 20) return numero;

  return (
    somenteDigitos.slice(0, 7) +
    '-' +
    somenteDigitos.slice(7, 9) +
    '.' +
    somenteDigitos.slice(9, 13) +
    '.' +
    somenteDigitos.slice(13, 14) +
    '.' +
    somenteDigitos.slice(14, 16) +
    '.' +
    somenteDigitos.slice(16, 20)
  );
}

export function limparNumeroProcesso(numero: string): string {
  return numero.replace(/\D/g, '');
}
