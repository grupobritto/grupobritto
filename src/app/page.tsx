import Link from 'next/link';

export default function Home() {
  return (
    <>
      <main className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <h1 className="text-(--color-texto)">Hello, VeriJus</h1>
          <div className="w-32 rounded bg-neutral-100 p-2 text-center text-zinc-900 hover:bg-(--color-highlight) hover:text-white">
            <Link href={'/dashboard'}>Dashboard</Link>
          </div>
        </div>
      </main>
    </>
  );
}
