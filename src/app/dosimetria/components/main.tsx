'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaPlus } from 'react-icons/fa';
import CrimeForm from '@/components/dosimetria/CrimeForm';

// Definição da interface para um único crime
interface Crime {
  id: number;
  anos: number;
  meses: number;
  dias: number;
  diasMulta: number;
  operacao: '+' | '-';
  numerador: number;
  denominador: number;
}

// Definição da interface para o resultado
interface Resultado {
  penaAnos: number;
  penaMeses: number;
  penaDias: number;
  diasMultaFinal: number;
  dataInicio: string;
  dataTermino: string;
}

export default function HomePage() {
  // CORREÇÃO: "anies" foi trocado por "useState"
  const [crimes, setCrimes] = useState<Crime[]>([
    {
      id: 1,
      anos: 0,
      meses: 0,
      dias: 0,
      diasMulta: 0,
      operacao: '+',
      numerador: 1,
      denominador: 6,
    },
  ]);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [dataBase, setDataBase] = useState<string>('');

  const handleAddCrime = () => {
    setCrimes([
      ...crimes,
      {
        id: Date.now(),
        anos: 0,
        meses: 0,
        dias: 0,
        diasMulta: 0,
        operacao: '+',
        numerador: 0,
        denominador: 1,
      },
    ]);
  };

  const handleRemoveCrime = (id: number) => {
    // CORREÇÃO: Adicionado o tipo ": Crime" ao parâmetro "crime"
    if (crimes.length > 1) {
      setCrimes(crimes.filter((crime: Crime) => crime.id !== id));
    }
  };

  const handleCrimeChange = (id: number, field: string, value: any) => {
    setCrimes(
      // CORREÇÃO: Adicionado o tipo ": Crime" ao parâmetro "crime"
      crimes.map((crime: Crime) => {
        if (crime.id === id) {
          if (field === 'denominador' && value === 0) {
            return { ...crime, [field]: 1 };
          }
          return { ...crime, [field]: value || 0 };
        }
        return crime;
      }),
    );
  };

  const handleCalculate = () => {
    if (crimes.length === 0) return;

    let penaTotalEmDias = 0;
    let multaTotal = 0;

    for (const crime of crimes) {
      let penaIndividualEmDias = crime.anos * 365 + crime.meses * 30 + crime.dias;

      if (crime.numerador > 0 && crime.denominador > 0) {
        const fracao = crime.numerador / crime.denominador;
        const ajuste = Math.round(penaIndividualEmDias * fracao);

        if (crime.operacao === '+') {
          penaIndividualEmDias += ajuste;
        } else {
          penaIndividualEmDias -= ajuste;
        }
      }

      penaTotalEmDias += penaIndividualEmDias;
      multaTotal += crime.diasMulta;
    }

    if (penaTotalEmDias < 0) {
      penaTotalEmDias = 0;
    }

    const totalMeses = Math.floor(penaTotalEmDias / 30);
    const diasFinais = Math.round(penaTotalEmDias % 30);

    const anosFinais = Math.floor(totalMeses / 12);
    const mesesFinais = Math.round(totalMeses % 12);

    const dataInicioObj = dataBase ? new Date(dataBase + 'T00:00:00') : new Date();
    const dataTerminoObj = new Date(dataInicioObj);
    dataTerminoObj.setDate(dataTerminoObj.getDate() + Math.ceil(penaTotalEmDias));

    setResultado({
      penaAnos: anosFinais,
      penaMeses: mesesFinais,
      penaDias: diasFinais,
      diasMultaFinal: multaTotal,
      dataInicio: dataInicioObj.toLocaleDateString('pt-BR'),
      dataTermino: dataTerminoObj.toLocaleDateString('pt-BR'),
    });
  };

  const handleClear = () => {
    setCrimes([
      {
        id: 1,
        anos: 0,
        meses: 0,
        dias: 0,
        diasMulta: 0,
        operacao: '+',
        numerador: 1,
        denominador: 6,
      },
    ]);
    setDataBase('');
    setResultado(null);
  };

  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Calculadora de Dosimetria Penal</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pena Base e Causas de Aumento/Diminuição</CardTitle>
        </CardHeader>
        <CardContent>
          {/* CORREÇÃO: Adicionado o tipo ": Crime" ao parâmetro "crime" */}
          {crimes.map((crime: Crime) => (
            <CrimeForm
              key={crime.id}
              crime={crime}
              onChange={handleCrimeChange}
              onRemove={handleRemoveCrime}
            />
          ))}
          <Button onClick={handleAddCrime} className="mt-4 w-full">
            <FaPlus className="mr-2" /> Adicionar Causa / Novo Crime
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Label htmlFor="data-inicio">Data de Início do Cumprimento / Data do Fato</Label>
        <Input
          id="data-inicio"
          type="date"
          value={dataBase}
          onChange={(e) => setDataBase(e.target.value)}
          className="mt-2"
        />
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={handleCalculate} size="lg">
          Calcular
        </Button>
        <Button onClick={handleClear} variant="outline" size="lg">
          Limpar Campos
        </Button>
      </div>

      {resultado && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resultado da Dosimetria</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="text-lg font-semibold">Pena Final</Label>
              <p className="text-xl">
                {resultado.penaAnos} anos, {resultado.penaMeses} meses e {resultado.penaDias} dias
              </p>
            </div>
            <div>
              <Label className="text-lg font-semibold">Valor Final da Multa (R$)</Label>
              <p className="text-xl">
                R$ {resultado.diasMultaFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <Label className="text-lg font-semibold">Data de Início</Label>
              <p className="text-xl">{resultado.dataInicio}</p>
            </div>
            <div>
              <Label className="text-lg font-semibold">Data de Término (Estimada)</Label>
              <p className="text-xl">{resultado.dataTermino}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
