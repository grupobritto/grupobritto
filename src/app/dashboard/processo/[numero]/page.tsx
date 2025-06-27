'use client';
export const runtime = 'edge';

import { useEffect, useMemo, useState, CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Loader2,
  ArrowLeft,
  Download,
  Gavel,
  Megaphone,
  CalendarClock,
  ChevronDown,
  Clock,
  UserCheck,
  UserX,
  FilePenLine,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FiltroMovimentos, OpcaoFiltro } from '../../components/FiltroMovimentos';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/lib/store';

// --- Interfaces ---
interface Polo {
  pessoa: { nome: string };
}
interface ComplementoTabelado {
  codigo: number;
  valor: number;
  nome: string;
  descricao: string;
}
interface Documento {
  idDocumento: string;
  descricao: string;
  tipoDocumento: number;
  movimentoId: string;
}
interface Movimento {
  dataHora: string;
  nome?: string;
  descricao?: string;
  movimentoNacional?: { codigoNacional: number; descricao: string };
  movimentoLocal?: { descricao: string };
  documentos?: Documento[];
  complementosTabelados?: ComplementoTabelado[];
}
interface Assunto {
  codigo: number;
  nome: string;
}
interface ProcessoResult {
  _source: {
    classe: { codigo: number; nome: string };
    assuntos: Assunto[];
    dataAjuizamento: string;
    numeroProcesso: string;
    orgaoJulgador: { codigo: number; nome: string };
    movimentos: Movimento[];
    poloAtivo?: Polo[];
    poloPassivo?: Polo[];
    [key: string]: unknown;
  };
}
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}
interface ApiErrorResponse {
  message: string;
}

// --- Estrutura de Destaques ---
interface DestaqueInfo {
  label: string;
  Icon: React.ElementType;
}
const MAPA_DESTAQUES: Record<string, DestaqueInfo> = {
  sentença: { label: 'Sentença', Icon: Gavel },
  decisão: { label: 'Decisão', Icon: Gavel },
  acórdão: { label: 'Acórdão', Icon: Gavel },
  publicado: { label: 'Publicação', Icon: Megaphone },
  audiência: { label: 'Audiência', Icon: CalendarClock },
  petição: { label: 'Petição', Icon: FilePenLine },
  concluso: { label: 'Conclusão', Icon: ClipboardCheck },
};

const getDestaqueInfo = (descricao: string): DestaqueInfo | null => {
  const descLower = descricao.toLowerCase();
  for (const chave in MAPA_DESTAQUES) {
    if (descLower.includes(chave)) return MAPA_DESTAQUES[chave];
  }
  return null;
};
const opcoesFiltro: OpcaoFiltro[] = Object.entries(MAPA_DESTAQUES).map(
  ([value, { label, Icon }]) => ({ value, label, Icon }),
);

export default function ProcessoDetalhePage() {
  const params = useParams();
  const numeroProcesso = params.numero as string;
  const [resultado, setResultado] = useState<ProcessoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [filtroMovimentos, setFiltroMovimentos] = useState('');
  const workerApiUrl = process.env.NEXT_PUBLIC_WORKER_URL;

  // CORREÇÃO: Acessar a estrutura correta do store
  const { animationSpeeds, sensitiveFields, blurLevel } = useSettingsStore();
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (numeroProcesso) {
      const fetchDetalhesProcesso = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/consulta-processo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numeroProcesso }),
          });
          if (!response.ok) {
            const errorData = (await response.json()) as ApiErrorResponse;
            throw new Error(errorData.message || 'Erro ao buscar detalhes do processo.');
          }
          const data = (await response.json()) as ProcessoResult;
          setResultado(data);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
          setError(message);
          toast.error(message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetalhesProcesso();
    }
  }, [numeroProcesso]);

  const handleForceCheck = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${workerApiUrl}/api/monitor/force-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroProcesso }),
      });
      const result = (await response.json()) as ApiResponse;
      if (!response.ok || !result.success)
        throw new Error(result.error || 'Ocorreu um erro desconhecido.');
      toast.success(result.message || 'Verificação concluída com sucesso!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na verificação: ${message}';
      toast.error(`Falha na verificação: ${message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const movimentosFiltrados = useMemo(() => {
    const sortedMovimentos =
      resultado?._source.movimentos.sort(
        (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
      ) || [];
    if (!filtroMovimentos) return sortedMovimentos;
    return sortedMovimentos.filter((mov: Movimento) => {
      const baseDesc =
        mov.movimentoNacional?.descricao ||
        mov.nome ||
        mov.descricao ||
        mov.movimentoLocal?.descricao ||
        '';
      const complementosDesc =
        mov.complementosTabelados?.map((c: ComplementoTabelado) => c.nome).join(' ') || '';
      const descricaoFinal = [baseDesc, complementosDesc].filter(Boolean).join(' ').toLowerCase();
      return descricaoFinal.includes(filtroMovimentos.toLowerCase());
    });
  }, [resultado, filtroMovimentos]);
  const movimentosAgrupados = useMemo(() => {
    return movimentosFiltrados.reduce((acc: Record<string, Movimento[]>, mov: Movimento) => {
      const data = new Date(mov.dataHora);
      const chaveMesAno = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(data);
      if (!acc[chaveMesAno]) {
        acc[chaveMesAno] = [];
      }
      acc[chaveMesAno].push(mov);
      return acc;
    }, {});
  }, [movimentosFiltrados]);

  useEffect(() => {
    if (filtroMovimentos && movimentosFiltrados.length > 0) {
      const primeiroItemFiltrado = movimentosFiltrados[0];
      const chaveMesAno = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(primeiroItemFiltrado.dataHora));
      setOpenMonths((prev) => ({ ...prev, [chaveMesAno]: true }));
    }
  }, [filtroMovimentos, movimentosFiltrados]);

  const expandirTodos = () => {
    const todosAbertos = Object.keys(movimentosAgrupados).reduce(
      (acc, mesAno) => {
        acc[mesAno] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setOpenMonths(todosAbertos);
  };
  const recolherTodos = () => {
    setOpenMonths({});
  };

  // CORREÇÃO: Usar a velocidade de animação correta do store
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 * (1 / animationSpeeds.filter) } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 * (1 / animationSpeeds.filter) } },
  };

  const getBlurStyle = (isSensitive: boolean): CSSProperties => ({
    filter: isSensitive && blurLevel > 0 ? `blur(${blurLevel * 1.5}px)` : 'none',
    pointerEvents: (isSensitive && blurLevel > 0
      ? 'none'
      : 'auto') as CSSProperties['pointerEvents'],
    transition: 'filter 0.3s ease',
  });

  if (isLoading)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-background-geral)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-textos-icones)]" />
      </main>
    );
  if (error)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-background-geral)]">
        <div className="rounded-lg bg-[var(--color-background-menus)] p-6 shadow-lg">
          <h2 className="font-heading text-lg font-bold text-[var(--color-highlight)]">Erro</h2>
          <p className="mt-2 text-[var(--color-textos-icones)]">{error}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-md bg-(--color-highlight) px-4 py-2 text-white"
          >
            Voltar
          </Link>
        </div>
      </main>
    );
  if (!resultado) return null;

  const { _source: processo } = resultado;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col gap-6 md:gap-8"
    >
      <motion.header
        variants={itemVariants}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <Link
            href="/dashboard/processo"
            className="mb-2 flex items-center text-sm text-[var(--color-texto-muted)] hover:text-[var(--color-textos-icones)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Processos
          </Link>
          <h1 className="font-heading text-xl font-bold text-[var(--color-textos-icones)] md:text-2xl">
            Detalhes do Processo
          </h1>
          <p
            style={getBlurStyle(sensitiveFields.numeroProcesso)}
            className="font-mono text-[var(--color-texto-muted)] transition-all"
          >
            {processo.numeroProcesso}
          </p>
        </div>
        <Button
          onClick={handleForceCheck}
          disabled={isChecking}
          className="w-full bg-(--color-highlight) text-white transition-opacity hover:opacity-90 sm:w-auto"
        >
          {isChecking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {isChecking ? 'Verificando...' : 'Forçar Verificação'}
        </Button>
      </motion.header>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3"
      >
        <div className="rounded-lg bg-[var(--color-background-menus)] p-6 shadow lg:col-span-2">
          <h2 className="font-heading mb-4 text-lg font-bold">Dados Gerais</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="space-y-1">
                <h3 className="font-semibold">Classe Processual</h3>
                <p className="text-[var(--color-texto-muted)]">{processo.classe.nome}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Data de Ajuizamento</h3>
                <p className="text-[var(--color-texto-muted)]">
                  {new Date(processo.dataAjuizamento).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <h3 className="font-semibold">Órgão Julgador</h3>
                <p className="text-[var(--color-texto-muted)]">{processo.orgaoJulgador.nome}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <h3 className="font-semibold">Assuntos</h3>
                <ul className="list-inside list-disc text-[var(--color-texto-muted)]">
                  {processo.assuntos.map((assunto: Assunto) => (
                    <li key={assunto.codigo}>{assunto.nome}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-[var(--color-background-menus)] p-6 shadow">
          <h2 className="font-heading mb-4 text-lg font-bold">Partes do Processo</h2>
          <div
            style={getBlurStyle(sensitiveFields.nomesDasPartes)}
            className="space-y-4 transition-all"
          >
            <div>
              <h3 className="mb-2 flex items-center font-semibold">
                <UserCheck className="mr-2 h-5 w-5 text-blue-400" /> Polo Ativo
              </h3>
              <ul className="list-none space-y-1 text-sm text-[var(--color-texto-muted)]">
                {processo.poloAtivo && processo.poloAtivo.length > 0 ? (
                  processo.poloAtivo.map((parte: Polo, idx: number) => (
                    <li key={`ativo-${idx}`}>{parte.pessoa.nome}</li>
                  ))
                ) : (
                  <li>Informação não disponível</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 flex items-center font-semibold">
                <UserX className="mr-2 h-5 w-5 text-red-400" /> Polo Passivo
              </h3>
              <ul className="list-none space-y-1 text-sm text-[var(--color-texto-muted)]">
                {processo.poloPassivo && processo.poloPassivo.length > 0 ? (
                  processo.poloPassivo.map((parte: Polo, idx: number) => (
                    <li key={`passivo-${idx}`}>{parte.pessoa.nome}</li>
                  ))
                ) : (
                  <li>Informação não disponível</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="rounded-lg bg-[var(--color-background-menus)] p-6 shadow">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold">Linha do Tempo das Movimentações</h2>
              <p className="text-sm text-[var(--color-texto-muted)]">
                Exibindo {movimentosFiltrados.length} movimentações.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="dashboard"
                size="sm"
                onClick={expandirTodos}
                className="border-[var(--color-borda)] bg-transparent text-[var(--color-textos-icones)] hover:bg-[var(--color-background-hover)]"
              >
                Expandir Todos
              </Button>
              <Button
                variant="dashboard"
                size="sm"
                onClick={recolherTodos}
                className="border-[var(--color-borda)] bg-transparent text-[var(--color-textos-icones)] hover:bg-[var(--color-background-hover)]"
              >
                Recolher Todos
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <FiltroMovimentos
              value={filtroMovimentos}
              onValueChange={setFiltroMovimentos}
              opcoes={opcoesFiltro}
            />
          </div>

          <div className="mt-6">
            {movimentosFiltrados.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(movimentosAgrupados).map(
                  ([mesAno, movimentosDoMes], groupIndex) => (
                    <Collapsible
                      key={mesAno}
                      open={openMonths[mesAno] ?? (groupIndex === 0 && !filtroMovimentos)}
                      onOpenChange={(isOpen) =>
                        setOpenMonths((prev) => ({ ...prev, [mesAno]: isOpen }))
                      }
                    >
                      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--color-background-hover)]">
                        <h3 className="font-heading text-lg font-semibold capitalize">{mesAno}</h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-[var(--color-borda)] text-[var(--color-texto-muted)]"
                          >
                            {movimentosDoMes.length} eventos
                          </Badge>
                          <ChevronDown className="h-5 w-5 text-[var(--color-texto-muted)] transition-transform group-data-[state=open]:rotate-180" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <motion.ul
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                          className="mt-4 space-y-1"
                        >
                          {movimentosDoMes.map((mov: Movimento, movIndex: number) => {
                            const globalIndex = movimentosFiltrados.indexOf(mov);
                            const baseDesc =
                              mov.movimentoNacional?.descricao ||
                              mov.nome ||
                              mov.descricao ||
                              mov.movimentoLocal?.descricao ||
                              '';
                            const complementosDesc =
                              mov.complementosTabelados
                                ?.map((c: ComplementoTabelado) => c.nome)
                                .join(' ') || '';
                            const destaque = getDestaqueInfo(baseDesc);
                            const IconeMovimento = destaque ? destaque.Icon : Clock;
                            const hasExtraContent =
                              !!complementosDesc || (!!mov.documentos && mov.documentos.length > 0);
                            const showTimelineLine =
                              movimentosDoMes.length > 1 && movIndex < movimentosDoMes.length - 1;

                            return (
                              <motion.li
                                variants={itemVariants}
                                key={globalIndex}
                                id={`mov-${globalIndex}`}
                                className="flex gap-4"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={cn(
                                      'flex size-10 items-center justify-center rounded-full text-white shadow',
                                      destaque
                                        ? 'bg-(--color-highlight)'
                                        : 'bg-[var(--color-texto-muted)]',
                                    )}
                                  >
                                    <IconeMovimento className="size-5" />
                                  </div>
                                  {showTimelineLine && (
                                    <div className="h-full w-px bg-[var(--color-borda)]"></div>
                                  )}
                                </div>
                                <div className="w-full flex-grow pt-1.5">
                                  <Collapsible disabled={!hasExtraContent}>
                                    <CollapsibleTrigger
                                      disabled={!hasExtraContent}
                                      className="group/item flex w-full items-start justify-between gap-4 py-2 text-left disabled:cursor-default"
                                    >
                                      <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="text-base font-medium text-[var(--color-textos-icones)]">
                                            {baseDesc}
                                          </p>
                                          {destaque && (
                                            <Badge className="border-[var(--color-highlight)] text-[var(--color-texto-icone-highlight)]">
                                              {destaque.label}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-[var(--color-texto-muted)]">
                                          {new Date(mov.dataHora).toLocaleString('pt-BR')}
                                        </p>
                                      </div>
                                      {hasExtraContent && (
                                        <ChevronDown className="mt-1 h-5 w-5 flex-shrink-0 text-[var(--color-texto-muted)] transition-transform group-data-[state=open]:rotate-180" />
                                      )}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-4 space-y-4 pr-4 text-sm">
                                      {complementosDesc && (
                                        <p className="text-[var(--color-texto-muted)]">
                                          <strong className="text-[var(--color-textos-icones)]">
                                            Complementos:
                                          </strong>{' '}
                                          {complementosDesc}
                                        </p>
                                      )}
                                      {mov.documentos && mov.documentos.length > 0 && (
                                        <div className="space-y-2 rounded-md border border-[var(--color-borda)] p-3">
                                          <h4 className="font-semibold">Documentos Vinculados:</h4>
                                          {mov.documentos.map((doc: Documento) => (
                                            <div
                                              key={doc.idDocumento}
                                              className="flex items-center justify-between"
                                            >
                                              <span className="text-[var(--color-texto-muted)]">
                                                {doc.descricao || 'Documento sem descrição'}
                                              </span>
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button
                                                      variant="dashboard"
                                                      size="sm"
                                                      disabled
                                                      className="border-[var(--color-borda)] bg-transparent text-[var(--color-textos-icones)] hover:bg-[var(--color-background-hover)]"
                                                    >
                                                      <Download className="mr-2 h-4 w-4" />
                                                      Download
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>Download indisponível.</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              </motion.li>
                            );
                          })}
                        </motion.ul>
                      </CollapsibleContent>
                    </Collapsible>
                  ),
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-[var(--color-texto-muted)]">
                Nenhuma movimentação encontrada para o filtro atual.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
