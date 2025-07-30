import type { Metadata } from 'next';
import CalcJuros from './calculadora-juros';

export const metadata: Metadata = {
  title: 'Calculadora de Juros',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <main>
        <CalcJuros />
      </main>
    </>
  );
}
