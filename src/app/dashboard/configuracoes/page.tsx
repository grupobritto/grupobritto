// src/app/dashboard/configuracoes/page.tsx - CÓDIGO COMPLETO PARA SUBSTITUIÇÃO

'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/lib/store'; //
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator'; //
import { toast } from 'sonner';

function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="border border-[var(--color-borda)] bg-transparent text-[var(--color-textos-icones)] hover:bg-[var(--color-background-hover)]"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Interface para os dados do processo a serem exportados/importados
interface ExportProcesso {
  numero_processo: string;
  email: string;
  etiqueta_nome?: string | null;
  etiqueta_prioridade?: string | null;
  favorito: 0 | 1;
}

export default function ConfiguracoesPage() {
  const {
    animationSpeeds,
    blurLevel,
    sensitiveFields,
    setAnimationSpeed,
    setBlurLevel,
    toggleSensitiveField,
  } = useSettingsStore(); //

  const workerApiUrl = process.env.NEXT_PUBLIC_WORKER_URL;

  const handleExportProcesses = async () => {
    try {
      const response = await fetch(`${workerApiUrl}/api/processos/export`);
      if (!response.ok) {
        const errorData = await response.json(); // Removido 'unknown'
        // CORREÇÃO: Verificação de tipo mais segura
        const errorMessage =
          typeof errorData === 'object' &&
          errorData !== null &&
          'error' in errorData &&
          typeof errorData.error === 'string'
            ? errorData.error
            : 'Falha ao exportar processos.';
        throw new Error(errorMessage);
      }
      const data: ExportProcesso[] = await response.json();

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `juscheck_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup da lista de processos exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar processos:', error);
      toast.error(
        `Erro ao exportar processos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  };

  const handleImportProcesses = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Nenhum arquivo selecionado.');
      return;
    }

    try {
      const fileContent = await file.text();
      const importedData: ExportProcesso[] = JSON.parse(fileContent);

      // Validação básica da estrutura do arquivo JSON
      if (
        !Array.isArray(importedData) ||
        !importedData.every(
          (p) =>
            typeof p.numero_processo === 'string' &&
            typeof p.email === 'string' &&
            (p.etiqueta_nome === null || typeof p.etiqueta_nome === 'string') &&
            (p.etiqueta_prioridade === null || typeof p.etiqueta_prioridade === 'string') &&
            (p.favorito === 0 || p.favorito === 1),
        )
      ) {
        throw new Error(
          'Formato do arquivo JSON inválido. O arquivo deve conter uma lista de processos com campos específicos.',
        );
      }

      const response = await fetch(`${workerApiUrl}/api/processos/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importedData),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Removido 'unknown'
        // CORREÇÃO: Verificação de tipo mais segura
        const errorMessage =
          typeof errorData === 'object' &&
          errorData !== null &&
          'error' in errorData &&
          typeof errorData.error === 'string'
            ? errorData.error
            : 'Falha ao importar processos.';
        throw new Error(errorMessage);
      }

      const result = (await response.json()) as {
        success: boolean;
        numero_processo: string;
        error?: string;
      }[];
      const successCount = result.filter((r) => r.success).length;
      const errorCount = result.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast.success(`${successCount} processo(s) importado(s) com sucesso!`);
      }
      if (errorCount > 0) {
        const errorMessages = result
          .filter((r) => !r.success)
          .map((r) => `${r.numero_processo}: ${r.error}`)
          .join('\n');
        toast.error(`Falha ao importar ${errorCount} processo(s):\n${errorMessages}`);
        console.error(
          'Erros detalhados na importação:',
          result.filter((r) => !r.success),
        );
      } else if (successCount === 0) {
        toast.info('Nenhum processo foi importado (talvez já existam).');
      }

      // Opcional: Recarregar a lista de processos na página principal após a importação.
      // Você precisaria de um contexto ou forma de disparar o fetchProcessos da ProcessosPage
      // ou apenas instruir o usuário a recarregar a página.
    } catch (error) {
      console.error('Erro ao importar processos:', error);
      toast.error(
        `Erro ao importar processos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    } finally {
      // Limpar o input de arquivo para permitir a seleção do mesmo arquivo novamente se necessário
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Configurações</h1>
        <ToggleTheme />
      </div>

      <Card className="border-[var(--color-borda)] bg-[var(--color-background-menus)]">
        <CardHeader>
          <CardTitle className="font-heading">Preferências de Visualização</CardTitle>
          <CardDescription className="text-[var(--color-texto-muted)]">
            Ajuste como as informações são exibidas na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
          {/* Ocultar Dados Sensíveis */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Ocultar Dados Sensíveis</Label>
            <p className="-mt-2 text-sm text-[var(--color-texto-muted)]">
              Escolha quais informações devem ser desfocadas para maior privacidade.
            </p>
            <div className="flex items-center space-x-3">
              <Switch
                id="numero-processo-switch"
                checked={sensitiveFields.numeroProcesso}
                onCheckedChange={() => toggleSensitiveField('numeroProcesso')}
              />
              <Label htmlFor="numero-processo-switch">Número do Processo</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="nomes-partes-switch"
                checked={sensitiveFields.nomesDasPartes}
                onCheckedChange={() => toggleSensitiveField('nomesDasPartes')}
              />
              <Label htmlFor="nomes-partes-switch">Nomes das Partes</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="etiqueta-nome-switch"
                checked={sensitiveFields.etiquetaNome}
                onCheckedChange={() => toggleSensitiveField('etiquetaNome')}
              />
              <Label htmlFor="etiqueta-nome-switch">Etiqueta do Processo</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="email-notificacao-switch"
                checked={sensitiveFields.emailNotificacao}
                onCheckedChange={() => toggleSensitiveField('emailNotificacao')}
              />
              <Label htmlFor="email-notificacao-switch">E-mail de Notificação</Label>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="blur-level-slider">Nível de Desfoque</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="blur-level-slider"
                  min={0}
                  max={5}
                  step={1}
                  value={[blurLevel]}
                  onValueChange={(value) => setBlurLevel(value[0])}
                  className="w-[60%]"
                />
                <span className="w-[100px] text-center text-sm font-medium text-[var(--color-texto-muted)]">
                  {blurLevel === 0 ? 'Desativado' : `Nível ${blurLevel}`}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Velocidade das Animações */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Velocidade das Animações</Label>
            <p className="-mt-2 text-sm text-[var(--color-texto-muted)]">
              Ajuste a velocidade de diferentes animações da interface (1.0x é o padrão).
            </p>
            <div className="space-y-2 pt-2">
              <Label htmlFor="anim-list-slider">Animação da Lista de Processos</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="anim-list-slider"
                  min={0.2}
                  max={2}
                  step={0.1}
                  value={[animationSpeeds.listLoad]}
                  onValueChange={(value) => setAnimationSpeed('listLoad', value[0])}
                  className="w-[60%]"
                />
                <span className="w-[40px] text-center text-sm font-medium text-[var(--color-texto-muted)]">
                  {animationSpeeds.listLoad.toFixed(1)}x
                </span>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Label htmlFor="anim-filter-slider">Animação de Filtros e Detalhes</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="anim-filter-slider"
                  min={0.2}
                  max={2}
                  step={0.1}
                  value={[animationSpeeds.filter]}
                  onValueChange={(value) => setAnimationSpeed('filter', value[0])}
                  className="w-[60%]"
                />
                <span className="w-[40px] text-center text-sm font-medium text-[var(--color-texto-muted)]">
                  {animationSpeeds.filter.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Backup e Restauração */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Backup e Restauração</Label>
            <p className="-mt-2 text-sm text-[var(--color-texto-muted)]">
              Exporte sua lista de processos para um arquivo local ou importe um backup existente.
            </p>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button onClick={handleExportProcesses} variant="dashboard">
                Fazer Backup
              </Button>
              <Button variant="dashboard" asChild>
                <Label
                  htmlFor="import-file"
                  className="m-0 flex cursor-pointer items-center justify-center"
                >
                  Restaurar Backup
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    className="sr-only"
                    onChange={handleImportProcesses}
                  />
                </Label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
