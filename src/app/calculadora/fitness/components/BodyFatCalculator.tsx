import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Title from './Title';

type BodyFatResult = {
  bf: number;
};

export default function BodyFatCalculator() {
  const [idade, setIdade] = useState<number | ''>('');
  const [altura, setAltura] = useState<number | ''>('');
  const [peso, setPeso] = useState<number | ''>('');
  const [resultado, setResultado] = useState<BodyFatResult | null>(null);

  // Exemplo simples: cálculo estimado de % gordura corporal via fórmula (ex: US Navy)
  const calcularBodyFat = () => {
    if (!idade || !altura || !peso) return;

    // Fórmula simplificada (exemplo) – ajustar conforme necessário:
    // %Gordura = (1.20 × IMC) + (0.23 × idade) - 10.8 × sexo - 5.4
    // Considerando sexo masculino fixo para exemplo (sexo = 1)
    const imc = peso / (altura / 100) ** 2;
    const sexo = 1; // masculino
    const bf = 1.2 * imc + 0.23 * idade - 10.8 * sexo - 5.4;

    setResultado({ bf: parseFloat(bf.toFixed(2)) });
  };

  // Tipagem explícita dos eventos
  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<number | ''>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const valor = event.target.value;
      setter(valor === '' ? '' : Number(valor));
    };

  return (
    <Card className="space-y-4 p-6">
      <Title>Gordura Corporal</Title>

      <div>
        <Label className="mb-1">Idade</Label>
        <Input type="number" value={idade} onChange={handleChange(setIdade)} />
      </div>

      <div>
        <Label className="mb-1">Altura (cm)</Label>
        <Input type="number" value={altura} onChange={handleChange(setAltura)} />
      </div>

      <div>
        <Label className="mb-1">Peso (kg)</Label>
        <Input type="number" value={peso} onChange={handleChange(setPeso)} />
      </div>

      <Button onClick={calcularBodyFat}>Calcular</Button>

      {resultado && (
        <p className="pt-4 text-lg font-semibold">
          Percentual estimado de gordura corporal: {resultado.bf}%
        </p>
      )}
    </Card>
  );
}
