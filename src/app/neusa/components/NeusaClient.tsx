'use client';

import { Mail, MapPinned, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Neu() {
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
              <div className="size-96 rounded-full"></div>
              <div className="w-full p-6 text-center">
                {/* Nome */}
                {loading ? (
                  <Skeleton className="mx-auto mb-3 h-8 w-48" />
                ) : (
                  <h1 className="text-2xl font-bold tracking-widest text-(--neusa) uppercase dark:text-(--neusa)">
                    Neusa de Britto
                  </h1>
                )}

                {/* Subtítulo */}
                {loading ? (
                  <Skeleton className="mx-auto mb-5 h-4 w-56" />
                ) : (
                  <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">Aposentada</p>
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
                        <Phone className="size-5 text-(--neusa) dark:text-(--neusa)" />
                        (48) 988 053 736
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="size-5 text-(--neusa) dark:text-(--neusa)" />
                        neusa@grupobritto.com.br
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinned className="size-5 text-(--neusa) dark:text-(--neusa)" />
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
                    <></>
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
