import type { Metadata } from 'next';
import Tami from './components/TamilisClient';

export const metadata: Metadata = {
  title: 'Tamilis de Britto',
  description: 'Descrição a ser preenchida',
};

export default function Tamilis() {
  return (
    <>
      <Tami />
    </>
  );
}
