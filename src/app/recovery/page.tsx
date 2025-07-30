import type { Metadata } from 'next';
import Recovery from './recovery-password';

export const metadata: Metadata = {
  title: 'Recovery Password',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <main>
        <Recovery />
      </main>
    </>
  );
}
