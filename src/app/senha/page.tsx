import type { Metadata } from 'next';
import Senha from './components/senha';

export const metadata: Metadata = {
  title: 'Gerador de Senhas',
  description: 'Descrição a ser preenchida',
};

export default function GeradorDeSenha() {
  return (
    <>
      <Senha />
    </>
  );
}
