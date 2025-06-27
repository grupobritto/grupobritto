import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Title from './Title';

type ResultadoMacros = {
  prot: number;
  carb: number;
  gord: number;
};

export default function MacroCalculator() {
  const [calorias, setCalorias] = useState<number | ''>('');
  const [proteinasPerc, setProteinasPerc] = useState<number | ''>('');
  const [carbsPerc, setCarbsPerc] = useState<number | ''>('');
  const [gordurasPerc, setGordurasPerc] = useState<number | ''>('');
  const [resultado, setResultado] = useState<ResultadoMacros | null>(null);
  const [erro, setErro] = useState<string>('');

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<number | ''>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setter(val === '' ? '' : Number(val));
    };

  const calcularMacros = () => {
    setErro('');
    setResultado(null);

    if (
      !calorias ||
      !proteinasPerc ||
      !carbsPerc ||
      !gordurasPerc ||
      calorias <= 0 ||
      proteinasPerc < 0 ||
      carbsPerc < 0 ||
      gordurasPerc < 0
    ) {
      setErro('Informe todos os campos corretamente.');
      return;
    }

    const somaPerc = proteinasPerc + carbsPerc + gordurasPerc;
    if (somaPerc !== 100) {
      setErro('A soma das porcentagens deve ser exatamente 100%.');
      return;
    }

    // Proteína e carboidrato = 4 kcal/g, gordura = 9 kcal/g
    const prot = (calorias * (proteinasPerc / 100)) / 4;
    const carb = (calorias * (carbsPerc / 100)) / 4;
    const gord = (calorias * (gordurasPerc / 100)) / 9;

    setResultado({
      prot: Math.round(prot),
      carb: Math.round(carb),
      gord: Math.round(gord),
    });
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Macronutrientes</Title>

      <div className="space-y-2">
        <Label htmlFor="calorias">Calorias totais (kcal)</Label>
        <Input
          id="calorias"
          type="number"
          value={calorias}
          onChange={handleChange(setCalorias)}
          min={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proteinasPerc">% Proteínas</Label>
        <Input
          id="proteinasPerc"
          type="number"
          value={proteinasPerc}
          onChange={handleChange(setProteinasPerc)}
          min={0}
          max={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="carbsPerc">% Carboidratos</Label>
        <Input
          id="carbsPerc"
          type="number"
          value={carbsPerc}
          onChange={handleChange(setCarbsPerc)}
          min={0}
          max={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gordurasPerc">% Gorduras</Label>
        <Input
          id="gordurasPerc"
          type="number"
          value={gordurasPerc}
          onChange={handleChange(setGordurasPerc)}
          min={0}
          max={100}
        />
      </div>

      <Button onClick={calcularMacros}>Calcular</Button>

      {erro && <p className="font-semibold text-red-600">{erro}</p>}

      {resultado && (
        <div className="space-y-1 pt-4">
          <p>
            <strong>Proteínas:</strong> {resultado.prot} g
          </p>
          <p>
            <strong>Carboidratos:</strong> {resultado.carb} g
          </p>
          <p>
            <strong>Gorduras:</strong> {resultado.gord} g
          </p>
        </div>
      )}
    </Card>
  );
}
