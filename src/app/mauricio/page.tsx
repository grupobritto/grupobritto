import type { Metadata } from 'next';
import Mau from './components/MauricioClient';

export const metadata: Metadata = {
  title: 'Mauricio de Britto',
  description: 'Descrição a ser preenchida',
};

export default function Mauricio() {
  return (
    <>
      <Mau />
    </>
  );
}
