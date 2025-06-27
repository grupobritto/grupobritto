// src/components/fitness/FCMaxCalculator.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Title from './Title';

export default function FCMaxCalculator() {
  const [idade, setIdade] = useState<number | ''>('');
  const [resultado, setResultado] = useState<{ fcMax: number; zonas: string[] } | null>(null);

  const calcular = () => {
    if (!idade || idade <= 0) {
      setResultado(null);
      return;
    }
    const fcMax = 220 - idade;
    const zonas = [
      `Zona 1: ${Math.round(fcMax * 0.5)} - ${Math.round(fcMax * 0.6)} bpm (Recuperação)`,
      `Zona 2: ${Math.round(fcMax * 0.6)} - ${Math.round(fcMax * 0.7)} bpm (Aeróbica)`,
      `Zona 3: ${Math.round(fcMax * 0.7)} - ${Math.round(fcMax * 0.8)} bpm (Resistência)`,
      `Zona 4: ${Math.round(fcMax * 0.8)} - ${Math.round(fcMax * 0.9)} bpm (Anaeróbica)`,
      `Zona 5: ${Math.round(fcMax * 0.9)} - ${fcMax} bpm (Pico)`,
    ];
    setResultado({ fcMax, zonas });
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Frequência Cardíaca</Title>
      <div className="space-y-2">
        <Label htmlFor="idade-fcmax">Idade (anos)</Label>
        <Input
          id="idade-fcmax"
          type="number"
          value={idade}
          onChange={(e) => setIdade(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
        />
      </div>
      <Button onClick={calcular}>Calcular</Button>
      {resultado && (
        <div>
          <p>
            <strong>FC Máxima:</strong> {resultado.fcMax} bpm
          </p>
          <ul className="mt-2 ml-6 list-disc">
            {resultado.zonas.map((zona, i) => (
              <li key={i}>{zona}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
