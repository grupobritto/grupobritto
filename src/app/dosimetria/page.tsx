import type { Metadata } from 'next';
import Dosimetria from './components/main';

export const metadata: Metadata = {
  title: 'Calculadora de Dosimetria Penal',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <Dosimetria />
    </>
  );
}
