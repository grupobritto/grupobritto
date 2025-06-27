import type { Metadata } from 'next';
import Json from './components/json';

export const metadata: Metadata = {
  title: 'Gerador JSON',
  description: 'Descrição a ser preenchida',
};

export default function GeradorJSONMock() {
  return (
    <>
      <Json />
    </>
  );
}
