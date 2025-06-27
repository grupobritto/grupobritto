import type { Metadata } from 'next';
import Fe from './components/FelipeClient';

export const metadata: Metadata = {
  title: 'Luis Felipe de Britto',
  description: 'Descrição a ser preenchida',
};

export default function Felipe() {
  return (
    <>
      <Fe />
    </>
  );
}
