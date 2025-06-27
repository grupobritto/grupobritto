// src/components/fitness/RepMaxCalculator.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Title from './Title';

export default function RepMaxCalculator() {
  const [peso, setPeso] = useState<number | ''>('');
  const [reps, setReps] = useState<number | ''>('');
  const [resultado, setResultado] = useState<number | null>(null);

  const calcular = () => {
    if (!peso || peso <= 0 || !reps || reps <= 0) {
      setResultado(null);
      return;
    }
    // Fórmula Epley
    const oneRM = peso * (1 + reps / 30);
    setResultado(oneRM);
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Repetição Máxima</Title>
      <div className="space-y-2">
        <Label htmlFor="peso-1rm">Peso levantado (kg)</Label>
        <Input
          id="peso-1rm"
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reps-1rm">Repetições</Label>
        <Input
          id="reps-1rm"
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
          max={20}
        />
      </div>
      <Button onClick={calcular}>Calcular</Button>
      {resultado !== null && (
        <p>
          Estimativa 1RM: <strong>{resultado.toFixed(2)} kg</strong>
        </p>
      )}
    </Card>
  );
}
