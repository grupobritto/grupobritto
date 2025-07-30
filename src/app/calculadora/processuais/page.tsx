import type { Metadata } from 'next';
import CalcProcessuais from './calculadora-processuais';

export const metadata: Metadata = {
  title: 'Calculadora Processual',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <main>
        <CalcProcessuais />
      </main>
    </>
  );
}
