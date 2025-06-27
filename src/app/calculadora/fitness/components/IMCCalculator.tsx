import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Title from './Title';

type ResultadoIMC = {
  imc: number;
  classificacao: string;
};

export default function IMCCalculator() {
  const [peso, setPeso] = useState<number | ''>('');
  const [altura, setAltura] = useState<number | ''>('');
  const [resultado, setResultado] = useState<ResultadoIMC | null>(null);

  const handleChangePeso = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPeso(val === '' ? '' : Number(val));
  };

  const handleChangeAltura = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAltura(val === '' ? '' : Number(val));
  };

  const calcularIMC = () => {
    if (!peso || !altura || altura <= 0) {
      setResultado(null);
      return;
    }

    // altura em metros
    const alturaM = altura / 100;
    const imc = peso / (alturaM * alturaM);

    let classificacao = '';

    if (imc < 18.5) classificacao = 'Abaixo do peso';
    else if (imc < 24.9) classificacao = 'Peso normal';
    else if (imc < 29.9) classificacao = 'Sobrepeso';
    else if (imc < 34.9) classificacao = 'Obesidade grau I';
    else if (imc < 39.9) classificacao = 'Obesidade grau II';
    else classificacao = 'Obesidade grau III';

    setResultado({
      imc: parseFloat(imc.toFixed(2)),
      classificacao,
    });
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Índice de massa corporal</Title>

      <div className="space-y-2">
        <Label htmlFor="peso">Peso (kg)</Label>
        <Input
          id="peso"
          type="number"
          value={peso}
          onChange={handleChangePeso}
          min={1}
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="altura">Altura (cm)</Label>
        <Input
          id="altura"
          type="number"
          value={altura}
          onChange={handleChangeAltura}
          min={50}
          step="0.1"
        />
      </div>

      <Button onClick={calcularIMC}>Calcular</Button>

      {resultado && (
        <div className="space-y-1 pt-4">
          <p>
            <strong>IMC:</strong> {resultado.imc}
          </p>
          <p>
            <strong>Classificação:</strong> {resultado.classificacao}
          </p>
        </div>
      )}
    </Card>
  );
}
