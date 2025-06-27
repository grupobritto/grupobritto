import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Title from './Title';

type ResultadoMacros = {
  calorias: number;
  proteinas: number;
  carbs: number;
  gorduras: number;
  ajuste: number;
};

export default function BulkCutPlanner() {
  const [peso, setPeso] = useState<number | ''>('');
  const [objetivo, setObjetivo] = useState<'bulk' | 'cut'>('bulk');
  const [resultado, setResultado] = useState<ResultadoMacros | null>(null);

  const handleChangePeso = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPeso(val === '' ? '' : Number(val));
  };

  const calcularMacros = () => {
    if (!peso || peso <= 0) {
      setResultado(null);
      return;
    }

    // Ajuste calórico padrão para bulking +15%, cutting -20%
    const ajuste = objetivo === 'bulk' ? 0.15 : -0.2;

    // Calorias base: 40kcal/kg para bulking, 30kcal/kg para cutting
    const caloriasBase = objetivo === 'bulk' ? 40 : 30;

    const calorias = peso * caloriasBase * (1 + ajuste);

    // Proteínas: 2g por kg de peso
    const proteinas = peso * 2;

    // Gorduras: 25% das calorias totais (1g de gordura = 9kcal)
    const gorduras = (calorias * 0.25) / 9;

    // Carboidratos: restante das calorias (1g de carbo = 4kcal)
    const carbs = (calorias - (proteinas * 4 + gorduras * 9)) / 4;

    setResultado({
      calorias: Math.round(calorias),
      proteinas: Math.round(proteinas),
      gorduras: Math.round(gorduras),
      carbs: Math.round(carbs),
      ajuste: ajuste * 100,
    });
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Planejador Bulk/Cut</Title>

      <div className="space-y-2">
        <Label htmlFor="peso">Peso (kg)</Label>
        <Input id="peso" type="number" value={peso} onChange={handleChangePeso} min={1} />
      </div>

      <div className="w-full space-y-2">
        <Label>Objetivo</Label>
        <div className="flex w-full gap-4">
          <Button
            className="flex-1"
            variant={objetivo === 'bulk' ? 'default' : 'outline'}
            onClick={() => setObjetivo('bulk')}
          >
            Bulking
          </Button>
          <Button
            className="flex-1"
            variant={objetivo === 'cut' ? 'default' : 'outline'}
            onClick={() => setObjetivo('cut')}
          >
            Cutting
          </Button>
        </div>
      </div>

      <Button onClick={calcularMacros}>Calcular</Button>

      {resultado && (
        <div className="space-y-1 pt-4">
          <p>
            <strong>Calorias diárias:</strong> {resultado.calorias} kcal
          </p>
          <p>
            <strong>Proteínas:</strong> {resultado.proteinas} g
          </p>
          <p>
            <strong>Carboidratos:</strong> {resultado.carbs} g
          </p>
          <p>
            <strong>Gorduras:</strong> {resultado.gorduras} g
          </p>
          <p>
            <em>
              Ajuste aplicado: {resultado.ajuste > 0 ? '+' : ''}
              {resultado.ajuste}%
            </em>
          </p>
        </div>
      )}
    </Card>
  );
}
