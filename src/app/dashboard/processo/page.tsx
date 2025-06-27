// src/app/dashboard/processo/page.tsx - CÓDIGO COMPLETO PARA SUBSTITUIÇÃO

'use client';

import { useState, useEffect, useCallback, useMemo, CSSProperties } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  Search,
  Star,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  FolderPlus,
  ExternalLink,
  Mail,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettingsStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTribunalInfo, getCourtExternalUrl } from '@/lib/tribunalUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Importar o novo componente de edição em lote e sua interface de dados
import { BulkProcessEditor, type ProcessoEditData } from '../components/BulkProcessEditor';

interface Processo {
  id: number;
  email: string;
  numero_processo: string;
  data_ultima_verificacao: string | null;
  etiqueta_nome?: string | null;
  etiqueta_prioridade?: string | null;
  ultima_movimentacao_data?: string | null;
  ultima_movimentacao_descricao?: string | null;
  ultima_notificacao?: string | null;
  favorito: 0 | 1;
}
interface AddProcessoData {
  numero_processo: string;
  email: string;
  etiqueta_nome: string;
  etiqueta_prioridade: string;
  notificar_email: boolean;
}
interface EditProcessoData {
  id: number | null;
  email: string;
  etiqueta_nome: string;
  etiqueta_prioridade: string;
}

const formatarData = (data: string | null | undefined) => {
  if (!data) return 'N/A';
  try {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Data inválida';
  }
};

const getPriorityBadge = (priority?: string | null) => {
  const p = priority?.toLowerCase() || 'não definido';
  const baseClasses = 'w-24 flex justify-center text-xs font-bold';
  switch (p) {
    case 'alta':
      return (
        <Badge style={{ backgroundColor: '#FF6B6B', color: 'white' }} className={baseClasses}>
          Alta
        </Badge>
      );
    case 'média':
      return (
        <Badge style={{ backgroundColor: '#FFD166', color: '#111' }} className={baseClasses}>
          Média
        </Badge>
      );
    case 'baixa':
      return (
        <Badge style={{ backgroundColor: '#06D6A0', color: 'white' }} className={baseClasses}>
          Baixa
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={baseClasses}>
          Não definido
        </Badge>
      );
  }
};

async function handleApiError(response: Response, defaultMessage: string): Promise<Error> {
  try {
    const errorData: unknown = await response.json();

    if (
      typeof errorData === 'object' &&
      errorData !== null &&
      'error' in errorData &&
      typeof (errorData as Record<string, unknown>).error === 'string'
    ) {
      return new Error((errorData as { error: string }).error);
    }
  } catch {
    // Ignora erros de parsing do JSON e usa a mensagem padrão.
  }

  return new Error(defaultMessage);
}

const PRIORIDADES = ['Alta', 'Média', 'Baixa', 'Não definido'];

const priorityOrder: Record<string, number> = {
  alta: 1,
  média: 2,
  baixa: 3,
  'não definido': 4,
};

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [processoParaEditar, setProcessoParaEditar] = useState<Processo | null>(null);

  const [addFormData, setAddFormData] = useState<AddProcessoData>({
    numero_processo: '',
    email: '',
    etiqueta_nome: '',
    etiqueta_prioridade: 'Não definido',
    notificar_email: true,
  });
  const [editFormData, setEditFormData] = useState<EditProcessoData>({
    id: null,
    email: '',
    etiqueta_nome: '',
    etiqueta_prioridade: 'Não definido',
  });
  const [bulkAddData, setBulkAddData] = useState({ numeros: '', email: '' });
  const [bulkAddStep, setBulkAddStep] = useState(1); // 1: input, 2: editor

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('todos');

  const [stateFilter, setStateFilter] = useState('todos');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { itemsPerPage, setItemsPerPage, blurLevel, sensitiveFields, animationSpeeds } =
    useSettingsStore();
  const workerApiUrl = process.env.NEXT_PUBLIC_WORKER_URL;

  const fetchProcessos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${workerApiUrl}/api/processos`);
      if (!response.ok) throw new Error('Falha ao buscar dados.');
      const data: Processo[] = await response.json();
      setProcessos(data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? `Erro ao carregar processos: ${err.message}`
          : 'Erro desconhecido ao carregar processos.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [workerApiUrl]);

  useEffect(() => {
    fetchProcessos();
  }, [fetchProcessos]);

  const sortedProcessos = useMemo(() => {
    return [...processos].sort((a, b) => {
      if (a.favorito !== b.favorito) return b.favorito - a.favorito;
      const aIsBaixado = a.ultima_movimentacao_descricao
        ?.toLowerCase()
        .includes('baixa definitiva');
      const bIsBaixado = b.ultima_movimentacao_descricao
        ?.toLowerCase()
        .includes('baixa definitiva');
      if (aIsBaixado !== bIsBaixado) return aIsBaixado ? 1 : -1;
      const priorityA = priorityOrder[a.etiqueta_prioridade?.toLowerCase() || 'não definido'] || 99;
      const priorityB = priorityOrder[b.etiqueta_prioridade?.toLowerCase() || 'não definido'] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      const dateA = a.ultima_movimentacao_data ? new Date(a.ultima_movimentacao_data).getTime() : 0;
      const dateB = b.ultima_movimentacao_data ? new Date(b.ultima_movimentacao_data).getTime() : 0;
      return dateB - dateA;
    });
  }, [processos]);

  const processosFiltrados = useMemo(() => {
    return sortedProcessos.filter((p) => {
      const porPrioridade =
        priorityFilter === 'todos' ||
        p.etiqueta_prioridade?.toLowerCase() === priorityFilter.toLowerCase();
      const porTermo =
        searchTerm === '' ||
        p.numero_processo.includes(searchTerm) ||
        (p.etiqueta_nome && p.etiqueta_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());

      const tribunalInfo = getTribunalInfo(p.numero_processo);
      const porEstado =
        stateFilter === 'todos' || (tribunalInfo && tribunalInfo.initials === stateFilter);

      return porPrioridade && porTermo && porEstado;
    });
  }, [sortedProcessos, searchTerm, priorityFilter, stateFilter]);

  const paginatedProcessos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [processosFiltrados, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processosFiltrados.length / itemsPerPage);

  const runActionAndRefresh = async (action: () => Promise<unknown>, successMessage?: string) => {
    setIsSubmitting(true);
    try {
      await action();
      if (successMessage) toast.success(successMessage);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setIsSubmitting(false);
      setIsRefreshing(true);
      setTimeout(() => {
        fetchProcessos();
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const handleResendConfirmation = async (processoId: number) => {
    await runActionAndRefresh(async () => {
      const response = await fetch(
        `${workerApiUrl}/api/processos/${processoId}/resend-confirmation`,
        {
          method: 'POST',
        },
      );
      if (!response.ok) {
        throw await handleApiError(response, 'Falha ao reenviar e-mail de confirmação.');
      }
    }, 'E-mail de confirmação reenviado!');
  };

  const handleToggleFavorite = async (processoId: number, currentStatus: 0 | 1) => {
    const originalProcessos = [...processos];
    const newStatus = (currentStatus === 1 ? 0 : 1) as 0 | 1;

    const updatedProcessos = processos.map((p) =>
      p.id === processoId ? { ...p, favorito: newStatus } : p,
    );
    updatedProcessos.sort((a, b) => b.favorito - a.favorito);
    setProcessos(updatedProcessos);

    try {
      await fetch(`${workerApiUrl}/api/processos/${processoId}/favorito`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorito: !!newStatus }),
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? `Erro ao favoritar: ${err.message}` : 'Erro desconhecido.',
      );
      setProcessos(originalProcessos);
    }
  };

  const handleAddProcesso = () => {
    runActionAndRefresh(async () => {
      if (!addFormData.numero_processo || !addFormData.email) {
        throw new Error('Número do processo e E-mail de Notificação são obrigatórios.');
      }
      const response = await fetch(`${workerApiUrl}/api/processos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });
      if (!response.ok) {
        throw await handleApiError(response, 'Falha ao adicionar processo.');
      }
      const novoProcesso = (await response.json()) as Processo;
      if (addFormData.notificar_email) {
        toast.info(`Notificação inicial sendo enviada para ${novoProcesso.email}`);
      }
      setIsAddDialogOpen(false);
      setAddFormData({
        numero_processo: '',
        email: '',
        etiqueta_nome: '',
        etiqueta_prioridade: 'Não definido',
        notificar_email: true,
      });
    }, 'Processo adicionado com sucesso!');
  };

  const handleBulkAdd = (processesToSubmit: ProcessoEditData[]) => {
    runActionAndRefresh(async () => {
      if (processesToSubmit.length === 0) {
        throw new Error('Nenhum processo válido para adicionar.');
      }

      const response = await fetch(`${workerApiUrl}/api/processos/bulk-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processesToSubmit),
      });

      if (!response.ok) {
        throw await handleApiError(response, 'Falha ao adicionar processos em lote.');
      }
      const result = (await response.json()) as {
        success: boolean;
        numero_processo: string;
        error?: string;
      }[];

      const successCount = result.filter((r) => r.success).length;
      const errorCount = result.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast.success(`${successCount} processo(s) adicionado(s) com sucesso.`);
      }
      if (errorCount > 0) {
        const errorMessages = result
          .filter((r) => !r.success)
          .map((r) => `${r.numero_processo}: ${r.error}`)
          .join('\n');
        toast.error(`Falha ao adicionar ${errorCount} processo(s):\n${errorMessages}`);
        console.error(
          'Erros detalhados na adição em lote:',
          result.filter((r) => !r.success),
        );
      } else if (successCount === 0) {
        toast.info('Nenhum processo válido foi adicionado.');
      }

      setIsBulkAddDialogOpen(false);
      setBulkAddStep(1); // Resetar para o primeiro passo
      setBulkAddData({ numeros: '', email: '' });
    });
  };

  const handleUpdateProcesso = () => {
    runActionAndRefresh(async () => {
      if (!editFormData.id) return;
      const response = await fetch(`${workerApiUrl}/api/processos/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) {
        throw await handleApiError(response, 'Falha ao atualizar processo.');
      }
      if (processoParaEditar?.email !== editFormData.email) {
        toast.info(`Notificações serão enviadas para o novo e-mail: ${editFormData.email}`);
      }
      setIsEditDialogOpen(false);
    }, 'Processo atualizado!');
  };

  const handleBulkDelete = () => {
    runActionAndRefresh(async () => {
      if (selectedIds.length === 0) return;
      const response = await fetch(`${workerApiUrl}/api/processos?ids=${selectedIds.join(',')}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw await handleApiError(response, 'Falha ao remover processos.');
      }
      setSelectedIds([]);
    }, `${selectedIds.length} processo(s) removido(s)!`);
  };

  const handleBulkCheck = () => {
    runActionAndRefresh(async () => {
      if (selectedIds.length === 0) return;
      const response = await fetch(`${workerApiUrl}/api/monitor/force-check-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!response.ok) {
        throw await handleApiError(response, 'Falha ao iniciar verificação em lote.');
      }
      const result = (await response.json()) as { message?: string };
      toast.info(result.message);
      setSelectedIds([]);
    });
  };

  const handleCheckAllMovimentations = () => {
    runActionAndRefresh(async () => {
      const response = await fetch(`${workerApiUrl}/api/monitor/force-check-all`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw await handleApiError(response, 'Falha ao iniciar verificação de todos os processos.');
      }
      const result = (await response.json()) as { message?: string };
      toast.info(result.message);
    });
  };

  const openEditDialog = (processo: Processo) => {
    setProcessoParaEditar(processo);
    setEditFormData({
      id: processo.id,
      email: processo.email,
      etiqueta_nome: processo.etiqueta_nome || '',
      etiqueta_prioridade: processo.etiqueta_prioridade || 'Não definido',
    });
    setIsEditDialogOpen(true);
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedProcessos.map((p) => p.id) : []);
  };

  const isAllOnPageSelected =
    paginatedProcessos.length > 0 && paginatedProcessos.every((p) => selectedIds.includes(p.id));

  const getBlurStyle = (isSensitive: boolean): CSSProperties => ({
    filter: isSensitive && blurLevel > 0 ? `blur(${blurLevel * 1.5}px)` : 'none',
    pointerEvents: (isSensitive && blurLevel > 0
      ? 'none'
      : 'auto') as CSSProperties['pointerEvents'],
    transition: 'filter 0.3s ease',
  });

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    processos.forEach((p) => {
      const info = getTribunalInfo(p.numero_processo);
      if (info && info.initials && info.initials !== 'BR') {
        states.add(info.initials);
      }
    });
    return Array.from(states).sort();
  }, [processos]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-heading text-3xl font-bold">Processos</h1>
        <div className="flex gap-2">
          <Button
            variant="dashboard"
            onClick={() => {
              setIsBulkAddDialogOpen(true);
              setBulkAddStep(1);
            }}
          >
            <FolderPlus className="mr-2 h-4 w-4" /> Adicionar em Lote
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Processo
          </Button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-grow">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              autoComplete="off"
              placeholder="Buscar por número, etiqueta ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus-visible:ring-ring w-full pl-10 focus-visible:ring-1"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="focus-visible:ring-ring w-full focus-visible:ring-1 md:w-[180px]">
              {' '}
              <SelectValue placeholder="Filtrar por prioridade" />{' '}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Prioridades</SelectItem>
              {PRIORIDADES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="focus-visible:ring-ring w-full focus-visible:ring-1 md:w-[180px]">
              {' '}
              <SelectValue placeholder="Filtrar por estado" />{' '}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Estados</SelectItem>
              {availableStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedIds.length > 0 && (
          <div className="bg-muted flex items-center gap-2 rounded-lg p-3">
            <span className="self-center text-sm font-medium">
              {selectedIds.length} selecionado(s)
            </span>
            <Button variant="dashboard" size="sm" onClick={handleBulkCheck} disabled={isSubmitting}>
              <RefreshCw className="mr-2 h-4 w-4" /> Verificar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isSubmitting}>
                  {' '}
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A ação removerá permanentemente os {selectedIds.length} processos selecionados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  {' '}
                  <AlertDialogCancel asChild>
                    <Button variant="secondary">Cancelar</Button>
                  </AlertDialogCancel>{' '}
                  <AlertDialogAction onClick={handleBulkDelete}>Confirmar</AlertDialogAction>{' '}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        <Button
          onClick={handleCheckAllMovimentations}
          disabled={isSubmitting || isLoading}
          variant={'dashboard'}
          className="w-full md:w-auto"
        >
          <RefreshCw
            className={cn('mr-2 h-4 w-4', (isSubmitting || isLoading) && 'animate-spin')}
          />{' '}
          Verificar Todos os Processos
        </Button>
      </div>

      <motion.div layout className="rounded-lg bg-(--color-background-menus) shadow-sm">
        <div className="relative overflow-x-auto">
          {(isLoading || isRefreshing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card/70 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm"
            >
              <Loader2 className="h-6 w-6 animate-spin" />
            </motion.div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] pl-4"></TableHead>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllOnPageSelected}
                    onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                  />
                </TableHead>
                <TableHead>Número do Processo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>E-mail Notificação</TableHead>
                <TableHead>Etiqueta</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Última Movimentação</TableHead>
                <TableHead>Última Notificação</TableHead>
                <TableHead className="pr-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && paginatedProcessos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center">
                    Nenhum processo encontrado.
                  </TableCell>
                </TableRow>
              )}
              <AnimatePresence>
                {!isLoading &&
                  paginatedProcessos.map((p) => {
                    const tribunalInfo = getTribunalInfo(p.numero_processo);
                    return (
                      <motion.tr
                        key={p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: animationSpeeds.listLoad
                            ? 0.4 * (1 / animationSpeeds.listLoad)
                            : 0,
                        }}
                        className="hover:bg-muted/50"
                        data-state={selectedIds.includes(p.id) ? 'selected' : ''}
                      >
                        <TableCell className="rounded-l-md pl-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleToggleFavorite(p.id, p.favorito)}
                          >
                            <Star
                              className={cn(
                                'h-5 w-5 transition-colors',
                                p.favorito
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground hover:text-yellow-300',
                              )}
                            />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(p.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedIds((prev) => [...prev, p.id]);
                              } else {
                                setSelectedIds((prev) => prev.filter((id) => id !== p.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell
                          className="font-mono"
                          style={getBlurStyle(sensitiveFields.numeroProcesso)}
                        >
                          <Link
                            href={`/dashboard/processo/${p.numero_processo}`}
                            className="text-primary hover:underline hover:opacity-80"
                          >
                            {p.numero_processo}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {tribunalInfo ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Avatar className="left-2 size-6 rounded">
                                    <AvatarImage
                                      src={tribunalInfo.flagUrl}
                                      alt={`Bandeira do ${tribunalInfo.name}`}
                                    />
                                    <AvatarFallback>{tribunalInfo.initials}</AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{tribunalInfo.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell
                          style={getBlurStyle(sensitiveFields.emailNotificacao)}
                          className="text-muted-foreground text-xs"
                        >
                          {p.email}
                        </TableCell>
                        <TableCell style={getBlurStyle(sensitiveFields.etiquetaNome)}>
                          {p.etiqueta_nome || 'N/A'}
                        </TableCell>
                        <TableCell>{getPriorityBadge(p.etiqueta_prioridade)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          <div
                            className="max-w-[200px] truncate"
                            title={p.ultima_movimentacao_descricao || ''}
                          >
                            {p.ultima_movimentacao_descricao || 'N/A'}
                          </div>
                          <div>{formatarData(p.ultima_movimentacao_data)}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatarData(p.ultima_notificacao)}
                        </TableCell>
                        <TableCell className="space-x-1 rounded-r-md pr-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="group"
                            onClick={() => openEditDialog(p)}
                          >
                            <Pencil className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="group"
                            onClick={() => handleResendConfirmation(p.id)}
                          >
                            <Mail className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="group">
                            <a
                              href={getCourtExternalUrl(p.numero_processo).url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Consultar em ${getCourtExternalUrl(p.numero_processo).name}`}
                            >
                              <ExternalLink className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
                            </a>
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-muted-foreground text-sm">
          Total de {processosFiltrados.length} processo(s).
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm">Itens por página:</p>
            <Select
              value={`${itemsPerPage}`}
              onValueChange={(v) => {
                setItemsPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="focus-visible:ring-ring w-[70px] focus-visible:ring-1">
                {' '}
                <SelectValue />{' '}
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((v) => (
                  <SelectItem key={v} value={`${v}`}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-1">
            <Button
              variant="dashboard"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="dashboard"
              size="icon"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="dashboard"
              size="icon"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="dashboard"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Processo</DialogTitle>
            <DialogDescription>
              Insira os dados do processo para iniciar o monitoramento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-proc">Número do Processo</Label>
              <Input
                id="add-proc"
                value={addFormData.numero_processo}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, numero_processo: e.target.value })
                }
                autoComplete="off"
                className="focus-visible:ring-ring focus-visible:ring-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">E-mail de Notificação</Label>
              <Input
                id="add-email"
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                autoComplete="off"
                className="focus-visible:ring-ring focus-visible:ring-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-etiqueta-nome">Etiqueta (Opcional)</Label>
              <Input
                id="add-etiqueta-nome"
                value={addFormData.etiqueta_nome}
                onChange={(e) => setAddFormData({ ...addFormData, etiqueta_nome: e.target.value })}
                autoComplete="off"
                className="focus-visible:ring-ring focus-visible:ring-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-prioridade">Prioridade</Label>
              <Select
                value={addFormData.etiqueta_prioridade}
                onValueChange={(v) => setAddFormData({ ...addFormData, etiqueta_prioridade: v })}
              >
                <SelectTrigger className="focus-visible:ring-ring w-full focus-visible:ring-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificar-email"
                checked={addFormData.notificar_email}
                onCheckedChange={(checked) =>
                  setAddFormData({ ...addFormData, notificar_email: !!checked })
                }
              />
              <Label htmlFor="notificar-email" className="text-sm font-normal">
                Enviar e-mail de confirmação ao cadastrar
              </Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="dashboard">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleAddProcesso} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Processo</DialogTitle>
            <DialogDescription>Processo: {processoParaEditar?.numero_processo}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">E-mail de Notificação</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                autoComplete="off"
                className="focus-visible:ring-ring focus-visible:ring-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-etiqueta-nome">Nome da Etiqueta</Label>
              <Input
                id="edit-etiqueta-nome"
                value={editFormData.etiqueta_nome}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, etiqueta_nome: e.target.value })
                }
                autoComplete="off"
                className="focus-visible:ring-ring focus-visible:ring-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-prioridade">Prioridade</Label>
              <Select
                value={editFormData.etiqueta_prioridade}
                onValueChange={(v) => setEditFormData({ ...editFormData, etiqueta_prioridade: v })}
              >
                <SelectTrigger className="focus-visible:ring-ring w-full focus-visible:ring-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="dashboard">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleUpdateProcesso} disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {bulkAddStep === 1 ? 'Adicionar Processos em Lote' : 'Revisar e Confirmar Processos'}
            </DialogTitle>
            <DialogDescription>
              {bulkAddStep === 1
                ? 'Cole uma lista de números de processo (um por linha) e informe um e-mail padrão.'
                : 'Revise os processos e ajuste os detalhes antes de finalizar a adição.'}
            </DialogDescription>
          </DialogHeader>
          {bulkAddStep === 1 && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bulk-numeros">Números dos Processos</Label>
                  <Textarea
                    id="bulk-numeros"
                    placeholder="0000000-00.0000.0.00.0000&#10;1111111-11.1111.1.11.1111"
                    rows={8}
                    value={bulkAddData.numeros}
                    onChange={(e) => setBulkAddData({ ...bulkAddData, numeros: e.target.value })}
                    autoComplete="off"
                    className="focus-visible:ring-ring focus-visible:ring-1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bulk-email">E-mail de Notificação (padrão)</Label>
                  <Input
                    id="bulk-email"
                    type="email"
                    value={bulkAddData.email}
                    onChange={(e) => setBulkAddData({ ...bulkAddData, email: e.target.value })}
                    autoComplete="off"
                    className="focus-visible:ring-ring focus-visible:ring-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="dashboard"
                    onClick={() => {
                      setIsBulkAddDialogOpen(false);
                      setBulkAddStep(1);
                      setBulkAddData({ numeros: '', email: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    const numeros = bulkAddData.numeros
                      .split('\n')
                      .map((n) => n.trim())
                      .filter(Boolean);
                    if (numeros.length === 0 || !bulkAddData.email) {
                      toast.error(
                        'É necessário informar os números dos processos e um e-mail padrão.',
                      );
                      return;
                    }
                    setBulkAddStep(2);
                  }}
                  disabled={isSubmitting || !bulkAddData.numeros || !bulkAddData.email}
                >
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}

          {bulkAddStep === 2 && (
            <BulkProcessEditor
              initialProcesses={bulkAddData}
              onCancel={() => {
                setIsBulkAddDialogOpen(false);
                setBulkAddStep(1);
                setBulkAddData({ numeros: '', email: '' });
              }}
              onConfirm={handleBulkAdd}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
