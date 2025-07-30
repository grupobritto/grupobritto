'use client';

import Image from 'next/image';

export default function Recovery() {
  return (
    <>
      <main className="flex h-screen w-screen items-center justify-center bg-white">
        <Image
          src="/macaco.png"
          alt="Imagem central"
          width={0}
          height={0}
          sizes="100vw"
          className="h-full w-full rounded-xl object-cover sm:h-[500px] sm:w-[500px] sm:object-contain"
        />
      </main>
    </>
  );
}
