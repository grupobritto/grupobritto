import type { Metadata } from 'next';
import Neu from './components/NeusaClient';

export const metadata: Metadata = {
  title: 'Neusa Maria de Britto',
  description: 'Descrição a ser preenchida',
};

export default function Neusa() {
  return (
    <>
      <Neu />
    </>
  );
}
