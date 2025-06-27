import { EyeOff, FileJson2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <main className="flex h-screen items-center justify-center bg-(--color-background-geral)">
        <div>
          <div className="flex space-x-4">
            <div className="flex w-48 items-center justify-center rounded bg-neutral-100 p-3 text-zinc-900 hover:bg-(--color-highlight) hover:text-white">
              <Link href={'/json'} className="flex">
                <FileJson2 className="mr-2" />
                JSON
              </Link>
            </div>
            <div className="flex w-48 items-center justify-center rounded bg-neutral-100 p-3 text-zinc-900 hover:bg-(--color-highlight) hover:text-white">
              <Link href={'/senha'} className="flex">
                <EyeOff className="mr-2" />
                Senha
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
