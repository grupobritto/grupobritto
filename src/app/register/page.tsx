import type { Metadata } from 'next';
import Register from './register';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Descrição a ser preenchida',
};

export default function Name() {
  return (
    <>
      <main>
        <Register />
      </main>
    </>
  );
}
