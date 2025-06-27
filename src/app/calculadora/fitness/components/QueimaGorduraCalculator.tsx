// src/components/fitness/QueimaGorduraCalculator.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import Title from './Title';

type FatorLipoliticoNivel = 'baixo' | 'medio' | 'alto';

export default function QueimaGorduraCalculator() {
  const [peso, setPeso] = useState<number | ''>('');
  const [nivel, setNivel] = useState<FatorLipoliticoNivel>('baixo');
  const [resultado, setResultado] = useState<number | null>(null);

  const fatores: Record<FatorLipoliticoNivel, number> = {
    baixo: 7,
    medio: 10,
    alto: 13,
  };

  const handleNivelChange = (value: string) => {
    if (value === 'baixo' || value === 'medio' || value === 'alto') {
      setNivel(value);
    }
  };

  const calcular = () => {
    if (!peso || peso <= 0) {
      setResultado(null);
      return;
    }
    // Estimativa de calorias queimadas por gordura (exemplo simplificado)
    const calorias = peso * fatores[nivel];
    setResultado(calorias);
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Queima de Gordura</Title>
      <div className="space-y-2">
        <Label htmlFor="peso-queima">Peso (kg)</Label>
        <Input
          id="peso-queima"
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nivel-queima">Nível de Atividade</Label>
        <Select value={nivel} onValueChange={handleNivelChange}>
          <SelectTrigger id="nivel-queima" className="w-full">
            <SelectValue placeholder="Selecione o nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baixo">Baixo</SelectItem>
            <SelectItem value="medio">Médio</SelectItem>
            <SelectItem value="alto">Alto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={calcular}>Calcular</Button>
      {resultado !== null && (
        <p>
          Calorias queimadas estimadas: <strong>{resultado} kcal</strong> por dia
        </p>
      )}
    </Card>
  );
}
