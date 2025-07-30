import type { Metadata } from 'next';
import Calcprevidenciaria from './calculadora-previdenciaria';

export const metadata: Metadata = {
  title: 'Calculadora Previdenciaria',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <main>
        <Calcprevidenciaria />
      </main>
    </>
  );
}
