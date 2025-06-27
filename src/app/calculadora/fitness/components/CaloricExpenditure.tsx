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
type Atividade = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muitoIntenso';

type Resultado = {
  tmb: number;
  gastoTotal: number;
};

const fatoresAtividade: Record<Atividade, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muitoIntenso: 1.9,
};

export default function CaloricExpenditure() {
  const [sexo, setSexo] = useState<Sexo>('masculino');
  const [peso, setPeso] = useState<number | ''>('');
  const [altura, setAltura] = useState<number | ''>('');
  const [idade, setIdade] = useState<number | ''>('');
  const [atividade, setAtividade] = useState<Atividade>('sedentario');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<number | ''>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const valor = event.target.value;
      setter(valor === '' ? '' : Number(valor));
    };

  const handleSexoChange = (value: string) => {
    if (value === 'masculino' || value === 'feminino') {
      setSexo(value);
    }
  };

  const handleAtividadeChange = (value: string) => {
    if (
      value === 'sedentario' ||
      value === 'leve' ||
      value === 'moderado' ||
      value === 'intenso' ||
      value === 'muitoIntenso'
    ) {
      setAtividade(value);
    }
  };

  const calcularTMB = () => {
    if (!peso || !altura || !idade) {
      setResultado(null);
      return;
    }

    let tmb: number;

    if (sexo === 'masculino') {
      tmb = 88.362 + 13.397 * peso + 4.799 * altura - 5.677 * idade;
    } else {
      tmb = 447.593 + 9.247 * peso + 3.098 * altura - 4.33 * idade;
    }

    const fator = fatoresAtividade[atividade];
    const gastoTotal = tmb * fator;

    setResultado({
      tmb: Math.round(tmb),
      gastoTotal: Math.round(gastoTotal),
    });
  };

  return (
    <Card className="space-y-4 p-6">
      <Title>Gasto Calórico Diário</Title>

      <div className="space-y-2">
        <Label htmlFor="sexo">Sexo</Label>
        <Select value={sexo} onValueChange={handleSexoChange}>
          <SelectTrigger id="sexo" className="w-full">
            <SelectValue placeholder="Selecione o sexo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masculino">Masculino</SelectItem>
            <SelectItem value="feminino">Feminino</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="peso" className="mb-1">
            Peso (kg)
          </Label>
          <Input id="peso" type="number" value={peso} onChange={handleChange(setPeso)} />
        </div>
        <div>
          <Label htmlFor="altura" className="mb-1">
            Altura (cm)
          </Label>
          <Input id="altura" type="number" value={altura} onChange={handleChange(setAltura)} />
        </div>
        <div>
          <Label htmlFor="idade" className="mb-1">
            Idade (anos)
          </Label>
          <Input id="idade" type="number" value={idade} onChange={handleChange(setIdade)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="atividade">Nível de Atividade</Label>
        <Select value={atividade} onValueChange={handleAtividadeChange}>
          <SelectTrigger id="atividade" className="w-full">
            <SelectValue placeholder="Selecione o nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentario">Sedentário (Pouco ou nenhum exercício)</SelectItem>
            <SelectItem value="leve">Leve (1-3 dias/semana)</SelectItem>
            <SelectItem value="moderado">Moderado (3-5 dias/semana)</SelectItem>
            <SelectItem value="intenso">Intenso (6-7 dias/semana)</SelectItem>
            <SelectItem value="muitoIntenso">
              Muito intenso (Atividade física diária intensa)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={calcularTMB}>Calcular</Button>

      {resultado && (
        <div className="space-y-1 pt-4">
          <p>
            <strong>TMB (Taxa Metabólica Basal):</strong> {resultado.tmb} kcal
          </p>
          <p>
            <strong>Gasto Calórico Total:</strong> {resultado.gastoTotal} kcal
          </p>
        </div>
      )}
    </Card>
  );
}
