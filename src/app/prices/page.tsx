import type { Metadata } from 'next';
import Prices from './components/prices';

export const metadata: Metadata = {
  title: 'JustCheck - Prices',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <Prices />
    </>
  );
}
