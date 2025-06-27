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

type Sexo = 'masculino' | 'feminino';

type ResultadoTMB = {
  tmb: number;
  gasto: number;
};

export default function TMBCalculator() {
  const [peso, setPeso] = useState<number | ''>('');
  const [altura, setAltura] = useState<number | ''>('');
  const [idade, setIdade] = useState<number | ''>('');
  const [sexo, setSexo] = useState<Sexo>('masculino');
  const [atividade, setAtividade] = useState<
    'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muitoIntenso'
  >('sedentario');
  const [resultado, setResultado] = useState<ResultadoTMB | null>(null);

  const fatorAtividade: Record<typeof atividade, number> = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muitoIntenso: 1.9,
  };

  const handleChangeNumber =
    (setter: React.Dispatch<React.SetStateAction<number | ''>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setter(val === '' ? '' : Number(val));
    };

  const calcularTMB = () => {
    if (!peso || !altura || !idade || peso <= 0 || altura <= 0 || idade <= 0) {
      setResultado(null);
      return;
    }

    let tmb: number;

    if (sexo === 'masculino') {
      tmb = 88.36 + 13.4 * peso + 4.8 * altura - 5.7 * idade;
    } else {
      tmb = 447.6 + 9.2 * peso + 3.1 * altura - 4.3 * idade;
    }

    const fator = fatorAtividade[atividade];

    const gasto = tmb * fator;

    setResultado({
      tmb: Math.round(tmb),
      gasto: Math.round(gasto),
    });
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <Title>Metabolismo Basal</Title>

      <div className="space-y-2">
        <Label htmlFor="peso">Peso (kg)</Label>
        <Input
          id="peso"
          type="number"
          value={peso}
          onChange={handleChangeNumber(setPeso)}
          min={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="altura">Altura (cm)</Label>
        <Input
          id="altura"
          type="number"
          value={altura}
          onChange={handleChangeNumber(setAltura)}
          min={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="idade">Idade (anos)</Label>
        <Input
          id="idade"
          type="number"
          value={idade}
          onChange={handleChangeNumber(setIdade)}
          min={1}
        />
      </div>

      <div className="w-full space-y-2">
        <Label>Sexo</Label>
        <div className="flex w-full gap-4">
          <Button
            className="flex-1"
            variant={sexo === 'masculino' ? 'default' : 'outline'}
            onClick={() => setSexo('masculino')}
          >
            Masculino
          </Button>
          <Button
            className="flex-1"
            variant={sexo === 'feminino' ? 'default' : 'outline'}
            onClick={() => setSexo('feminino')}
          >
            Feminino
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Atividade física</Label>
        <Select
          value={atividade}
          onValueChange={(value) =>
            setAtividade(value as 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muitoIntenso')
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o nível de atividade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentario">Sedentário</SelectItem>
            <SelectItem value="leve">Leve</SelectItem>
            <SelectItem value="moderado">Moderado</SelectItem>
            <SelectItem value="intenso">Intenso</SelectItem>
            <SelectItem value="muitoIntenso">Muito intenso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={calcularTMB}>Calcular</Button>

      {resultado && (
        <div className="space-y-1 pt-4">
          <p>
            <strong>TMB:</strong> {resultado.tmb} kcal
          </p>
          <p>
            <strong>Gasto calórico diário estimado:</strong> {resultado.gasto} kcal
          </p>
        </div>
      )}
    </Card>
  );
}
