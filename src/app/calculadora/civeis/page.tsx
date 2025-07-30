import type { Metadata } from 'next';
import CalcCiveis from './calculadora-civeis';

export const metadata: Metadata = {
  title: 'Calculadora Civeis',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <main>
        <CalcCiveis />
      </main>
    </>
  );
}
