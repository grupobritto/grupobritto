import type { Metadata } from 'next';
import CalcTributarias from './calculadora-tributarias';

export const metadata: Metadata = {
  title: 'Calculadora Tributaria',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <main>
        <CalcTributarias />
      </main>
    </>
  );
}
