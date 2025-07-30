import type { Metadata } from 'next';
import CalcTrabalhista from './calculadora-trabalhista';

export const metadata: Metadata = {
  title: 'Calculadora Trabalhista',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <main>
        <CalcTrabalhista />
      </main>
    </>
  );
}
