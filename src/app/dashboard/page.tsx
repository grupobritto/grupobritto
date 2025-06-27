'use client';

import { useEffect, useState, useMemo } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, BarChartHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

interface DashboardMetrics {
  totalProcessos: number;
  novosProcessos: number;
  novasMovimentacoes: number;
  totalProcessosPeriodoAnterior: number;
  prioridades: { name: string; value: number }[];
  atividadeDiaria: { day: string; count: number }[];
}

const CHART_COLORS = {
  red: '#FF6B6B',
  yellow: '#FFD166',
  green: '#06D6A0',
  blue: '#118AB2',
  gray: '#CED4DA',
};

export default function DashboardPrincipalPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [activityChartType, setActivityChartType] = useState<'bar' | 'line'>('bar');
  const workerApiUrl = process.env.NEXT_PUBLIC_WORKER_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${workerApiUrl}/api/dashboard-metrics?days=${dateRange}`);
        if (response.ok) {
          setMetrics(await response.json());
        } else {
          console.error('Erro ao buscar métricas do dashboard');
          setMetrics(null);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [workerApiUrl, dateRange]);

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  const percentageChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? `(+${current})` : `(Novo)`;
    const change = ((current - previous) / previous) * 100;
    return `(${change >= 0 ? '+' : ''}${change.toFixed(1)}%)`;
  };

  const pieData = useMemo(() => {
    if (!metrics?.prioridades) return { labels: [], datasets: [] };

    const priorityMap: Record<string, { color: string; order: number }> = {
      alta: { color: CHART_COLORS.red, order: 1 },
      média: { color: CHART_COLORS.yellow, order: 2 },
      baixa: { color: CHART_COLORS.green, order: 3 },
      indefinida: { color: CHART_COLORS.gray, order: 4 },
    };

    const sortedPriorities = [...metrics.prioridades].sort(
      (a, b) =>
        (priorityMap[a.name?.toLowerCase()]?.order || 99) -
        (priorityMap[b.name?.toLowerCase()]?.order || 99),
    );

    return {
      labels: sortedPriorities.map((p) => p.name.charAt(0).toUpperCase() + p.name.slice(1)),
      datasets: [
        {
          label: 'Processos',
          data: sortedPriorities.map((p) => p.value),
          backgroundColor: sortedPriorities.map(
            (p) => priorityMap[p.name?.toLowerCase()]?.color || CHART_COLORS.gray,
          ),
          borderColor: 'hsl(var(--card))',
          borderWidth: 2,
        },
      ],
    };
  }, [metrics]);

  const activityData = useMemo(() => {
    if (!metrics?.atividadeDiaria) return { labels: [], datasets: [] };
    return {
      labels: metrics.atividadeDiaria.map((a) =>
        new Date(a.day + 'T12:00:00Z').toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
      ),
      datasets: [
        {
          label: 'Movimentações por Dia',
          data: metrics.atividadeDiaria.map((a) => a.count),
          backgroundColor: CHART_COLORS.blue,
          borderColor: CHART_COLORS.blue,
          tension: 0.2,
        },
      ],
    };
  }, [metrics]);

  if (isLoading || !metrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const ActivityChart = activityChartType === 'bar' ? Bar : Line;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <div className="w-full sm:w-[180px]">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="15">Últimos 15 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="bg-card text-card-foreground rounded-lg p-6 shadow-sm">
          <CardHeader className="mb-2 p-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total de Processos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold">
              {metrics.totalProcessos}{' '}
              <span className="text-sm font-normal text-green-500">
                {percentageChange(metrics.totalProcessos, metrics.totalProcessosPeriodoAnterior)}
              </span>
            </p>
            <p className="text-muted-foreground text-xs">Comparado ao início do período</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground rounded-lg p-6 shadow-sm">
          <CardHeader className="mb-2 p-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Novos Processos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold">{metrics.novosProcessos}</p>
            <p className="text-muted-foreground text-xs">No período selecionado</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground rounded-lg p-6 shadow-sm">
          <CardHeader className="mb-2 p-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Novas Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold">{metrics.novasMovimentacoes}</p>
            <p className="text-muted-foreground text-xs">No período selecionado</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground rounded-lg p-6 shadow-sm">
          <CardHeader className="mb-2 p-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Prioridade Alta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold">
              {metrics.prioridades.find((p) => p.name === 'alta')?.value || 0}
            </p>
            <p className="text-muted-foreground text-xs">Processos que demandam atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-96 p-6">
          <h3 className="mb-4 font-semibold">Visão Geral de Prioridades</h3>
          <div className="relative h-[calc(100%-2rem)] w-full">
            <Pie options={chartOptions} data={pieData} />
          </div>
        </Card>
        <Card className="h-96 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Atividade Recente</h3>
            <Button
              variant="dashboard"
              size="sm"
              onClick={() => setActivityChartType((prev) => (prev === 'bar' ? 'line' : 'bar'))}
            >
              {activityChartType === 'bar' ? (
                <TrendingUp className="mr-2 h-4 w-4" />
              ) : (
                <BarChartHorizontal className="mr-2 h-4 w-4" />
              )}
              Alternar para {activityChartType === 'bar' ? 'Linhas' : 'Barras'}
            </Button>
          </div>
          <div className="relative h-[calc(100%-3rem)] w-full">
            <ActivityChart options={chartOptions} data={activityData} />
          </div>
        </Card>
      </div>
    </div>
  );
}
