import type { Metadata } from 'next';
import Jo from './components/JoseClient';

export const metadata: Metadata = {
  title: 'José Antônio de Britto Ramos',
  description: 'Descrição a ser preenchida',
};

export default function Jose() {
  return (
    <>
      <Jo />
    </>
  );
}
