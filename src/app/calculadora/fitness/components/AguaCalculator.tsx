// src/components/fitness/AguaCalculator.tsx
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

type AguaNivel = 'baixo' | 'moderado' | 'alto';

export default function AguaCalculator() {
  const [peso, setPeso] = useState<number | ''>('');
  const [nivel, setNivel] = useState<AguaNivel>('baixo');
  const [resultado, setResultado] = useState<number | null>(null);

  const fatores: Record<AguaNivel, number> = {
    baixo: 35,
    moderado: 45,
    alto: 55,
  };

  // Corrigindo o tipo no onValueChange para garantir o tipo AguaNivel
  const handleNivelChange = (value: string) => {
    if (value === 'baixo' || value === 'moderado' || value === 'alto') {
      setNivel(value);
    }
  };

  const calcular = () => {
    if (!peso || peso <= 0) {
      setResultado(null);
      return;
    }
    const ml = peso * fatores[nivel];
    setResultado(ml);
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Água Diária</Title>
      <div className="space-y-2">
        <Label htmlFor="peso-agua">Peso (kg)</Label>
        <Input
          id="peso-agua"
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nivel-agua">Nível de atividade</Label>
        <Select value={nivel} onValueChange={handleNivelChange}>
          <SelectTrigger id="nivel-agua" className="w-full">
            <SelectValue placeholder="Selecione nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baixo">Baixo</SelectItem>
            <SelectItem value="moderado">Moderado</SelectItem>
            <SelectItem value="alto">Alto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={calcular}>Calcular</Button>
      {resultado !== null && (
        <p>
          Quantidade ideal: <strong>{(resultado / 1000).toFixed(2)} litros</strong> por dia
        </p>
      )}
    </Card>
  );
}
