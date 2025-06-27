// src/components/fitness/MassaMagroCalculator.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Title from './Title';

export default function MassaMagroCalculator() {
  const [peso, setPeso] = useState<number | ''>('');
  const [percentualGordura, setPercentualGordura] = useState<number | ''>('');
  const [resultado, setResultado] = useState<number | null>(null);

  const calcular = () => {
    if (
      !peso ||
      peso <= 0 ||
      percentualGordura === '' ||
      percentualGordura < 0 ||
      percentualGordura > 100
    ) {
      setResultado(null);
      return;
    }
    const massaMagro = peso * (1 - percentualGordura / 100);
    setResultado(massaMagro);
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Massa Magra</Title>
      <div className="space-y-2">
        <Label htmlFor="peso-mm">Peso (kg)</Label>
        <Input
          id="peso-mm"
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="percentual-gordura">Percentual de Gordura (%)</Label>
        <Input
          id="percentual-gordura"
          type="number"
          value={percentualGordura}
          onChange={(e) =>
            setPercentualGordura(e.target.value === '' ? '' : Number(e.target.value))
          }
          min={0}
          max={100}
        />
      </div>
      <Button onClick={calcular}>Calcular</Button>
      {resultado !== null && (
        <p>
          Massa magra estimada: <strong>{resultado.toFixed(2)} kg</strong>
        </p>
      )}
    </Card>
  );
}
