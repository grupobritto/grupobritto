'use client';

import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPinned,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Mau() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-gray-300 dark:bg-zinc-700 ${className}`} />
  );

  return (
    <>
      <main>
        <div className="flex h-screen w-full items-center px-4 transition-colors duration-300">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded shadow-xl">
            <div className="flex flex-col items-center">
              <Image
                src="/me.png"
                alt="Foto de Mauricio"
                className="h-96 w-full object-cover"
                width={1024}
                height={1024}
              />

              <div className="w-full p-6 text-center">
                {/* Nome */}
                {loading ? (
                  <Skeleton className="mx-auto mb-3 h-8 w-48" />
                ) : (
                  <h1 className="text-2xl font-bold tracking-widest text-blue-600 uppercase dark:text-sky-400">
                    Mauricio de Britto
                  </h1>
                )}

                {/* Subtítulo */}
                {loading ? (
                  <Skeleton className="mx-auto mb-5 h-4 w-56" />
                ) : (
                  <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
                    Servidor público e acadêmico de Direito
                  </p>
                )}

                {/* Contatos */}
                <div className="mb-8 ml-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <>
                      <Skeleton className="mx-auto h-5 w-40 rounded" />
                      <Skeleton className="mx-auto h-5 w-56 rounded" />
                      <Skeleton className="mx-auto h-5 w-48 rounded" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Phone className="size-5 text-blue-500 dark:text-sky-400" />
                        (48) 920 027 494
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="size-5 text-blue-500 dark:text-sky-400" />
                        mauricio@grupobritto.com.br
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinned className="size-5 text-blue-500 dark:text-sky-400" />
                        Balneário Gaivota, Santa Catarina
                      </div>
                    </>
                  )}
                </div>

                {/* Redes Sociais */}
                <div className="flex justify-center gap-5">
                  {loading ? (
                    <>
                      <Skeleton className="h-8 w-8 rounded-xs" />
                      <Skeleton className="h-8 w-8 rounded-xs" />
                      <Skeleton className="h-8 w-8 rounded-xs" />
                      <Skeleton className="h-8 w-8 rounded-xs" />
                      <Skeleton className="h-8 w-8 rounded-xs" />
                    </>
                  ) : (
                    <>
                      <a
                        href="https://www.youtube.com/channel/UCYmQbgV1klkzPlpUDhg7YlQ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 transition hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        <Youtube className="size-5" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/brittosc/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 transition hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        <Linkedin className="size-5" />
                      </a>
                      <a
                        href="https://www.instagram.com/britto.sc/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 transition hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        <Instagram className="size-5" />
                      </a>
                      <a
                        href="https://x.com/brttoSC"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 transition hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        <Twitter className="size-5" />
                      </a>
                      <a
                        href="https://github.com/brittosc/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 transition hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        <Github className="size-5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
