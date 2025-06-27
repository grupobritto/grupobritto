// src/app/dashboard/processo/components/BulkProcessEditor.tsx - CÓDIGO COMPLETO PARA SUBSTITUIÇÃO

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatarNumeroProcesso, limparNumeroProcesso } from '@/lib/utils'; //
import { getTribunalInfo, TribunalInfo } from '@/lib/tribunalUtils'; // Importar TribunalInfo e getTribunalInfo
import { Badge } from '@/components/ui/badge'; // Importar Badge para uso

export interface ProcessoEditData {
  // Adicionada a palavra-chave 'export' aqui
  id: string; // Usar UUID para identificador temporário no frontend
  numero_processo: string;
  email: string;
  etiqueta_nome: string;
  etiqueta_prioridade: string;
  notificar_email: boolean;
  tribunalInfo?: TribunalInfo | null;
  isValid: boolean;
}

interface BulkProcessEditorProps {
  initialProcesses: { numeros: string; email: string };
  onCancel: () => void;
  onConfirm: (data: ProcessoEditData[]) => void; // Corrigido o tipo 'any[]' para 'ProcessoEditData[]'
  isSubmitting: boolean;
}

const PRIORIDADES = ['Alta', 'Média', 'Baixa', 'Não definido']; //

export function BulkProcessEditor({
  initialProcesses,
  onCancel,
  onConfirm,
  isSubmitting,
}: BulkProcessEditorProps) {
  const [processesToEdit, setProcessesToEdit] = useState<ProcessoEditData[]>([]);
  const [processingInitial, setProcessingInitial] = useState(true);

  useEffect(() => {
    const parseAndValidate = async () => {
      setProcessingInitial(true);
      const parsedProcesses = initialProcesses.numeros
        .split('\n') // Usar initialProcesses.numeros
        .map((n) => n.trim())
        .filter(Boolean)
        .map((numero, index) => {
          const cleanedNum = limparNumeroProcesso(numero); //
          const formattedNum = formatarNumeroProcesso(cleanedNum); //
          const info = getTribunalInfo(formattedNum); //

          return {
            id: `${Date.now()}-${index}`, // Unique ID for list rendering
            numero_processo: formattedNum,
            email: initialProcesses.email,
            etiqueta_nome: '',
            etiqueta_prioridade: 'Não definido',
            notificar_email: true,
            tribunalInfo: info,
            isValid: cleanedNum.length === 20 && info !== null, // Basic CNJ format validation
          };
        });
      setProcessesToEdit(parsedProcesses);
      setProcessingInitial(false);
    };

    parseAndValidate();
  }, [initialProcesses]);

  // Corrigido o tipo 'any' para 'string | boolean'
  const handleChange = (id: string, field: keyof ProcessoEditData, value: string | boolean) => {
    setProcessesToEdit((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // 'allValid' foi removida pois não estava sendo utilizada.
  const hasInvalid = processesToEdit.some((p) => !p.isValid);

  if (processingInitial) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground mt-4">Processando lista de processos...</p>
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto">
      {hasInvalid && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Processos com formato inválido detectados!</AlertTitle>
          <AlertDescription>
            Certifique-se de que todos os números de processo estão no formato CNJ válido (20
            dígitos). Processos inválidos não serão adicionados.
          </AlertDescription>
        </Alert>
      )}

      {processesToEdit.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          Nenhum processo válido para adicionar.
        </p>
      ) : (
        <div className="space-y-6">
          {processesToEdit.map((p) => (
            <div
              key={p.id}
              className={`rounded-md border p-4 ${!p.isValid ? 'border-destructive/50 bg-destructive/5' : 'border-input'}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`font-mono font-semibold ${!p.isValid ? 'text-destructive' : 'text-primary'}`}
                >
                  {p.numero_processo}
                </span>
                {p.tribunalInfo ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-6 w-6 border">
                          <AvatarImage
                            src={p.tribunalInfo.flagUrl}
                            alt={`Bandeira do ${p.tribunalInfo.name}`}
                          />
                          <AvatarFallback>{p.tribunalInfo.initials}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{p.tribunalInfo.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Badge variant="outline" className="text-destructive">
                    Tribunal Desconhecido
                  </Badge>
                )}
              </div>

              {!p.isValid && (
                <p className="text-destructive mb-3 text-sm">
                  Número de processo inválido ou tribunal não identificado.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`email-${p.id}`}>E-mail Notificação</Label>
                  <Input
                    id={`email-${p.id}`}
                    type="email"
                    value={p.email}
                    onChange={(e) => handleChange(p.id, 'email', e.target.value)}
                    disabled={isSubmitting || !p.isValid}
                    required
                    className={!p.isValid ? 'border-destructive' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`etiqueta-${p.id}`}>Etiqueta (Opcional)</Label>
                  <Input
                    id={`etiqueta-${p.id}`}
                    value={p.etiqueta_nome}
                    onChange={(e) => handleChange(p.id, 'etiqueta_nome', e.target.value)}
                    disabled={isSubmitting || !p.isValid}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`prioridade-${p.id}`}>Prioridade</Label>
                  <Select
                    value={p.etiqueta_prioridade}
                    onValueChange={(v) => handleChange(p.id, 'etiqueta_prioridade', v)}
                    disabled={isSubmitting || !p.isValid}
                  >
                    <SelectTrigger className={!p.isValid ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Não definido" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES.map((pri) => (
                        <SelectItem key={pri} value={pri}>
                          {pri}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end justify-start pb-2">
                  <Checkbox
                    id={`notificar-${p.id}`}
                    checked={p.notificar_email}
                    onCheckedChange={(checked) => handleChange(p.id, 'notificar_email', !!checked)}
                    disabled={isSubmitting || !p.isValid}
                  />
                  <Label htmlFor={`notificar-${p.id}`} className="ml-2 text-sm font-normal">
                    Notificar por e-mail
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="dashboard" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogClose>
        <Button
          onClick={() => onConfirm(processesToEdit.filter((p) => p.isValid))}
          disabled={isSubmitting || processesToEdit.filter((p) => p.isValid).length === 0}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Finalizar Adição ({processesToEdit.filter((p) => p.isValid).length})
        </Button>
      </DialogFooter>
    </div>
  );
}
