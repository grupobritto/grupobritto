'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import FCMaxCalculator from './components/FCMaxCalculator';
import MassaMagroCalculator from './components/MassaMagroCalculator';
import QueimaGorduraCalculator from './components/QueimaGorduraCalculator';
import RepMaxCalculator from './components/RepMaxCalculator';
import AguaCalculator from './components/AguaCalculator';
import BodyFatCalculator from './components/BodyFatCalculator';
import BulkCutPlanner from './components/BulkCutPlanner';
import CaloricExpenditure from './components/CaloricExpenditure';
import IMCCalculator from './components/IMCCalculator';
import MacroCalculator from './components/MacroCalculator';
import TMBCalculator from './components/TMBCalculator';

type Aba =
  | 'imc'
  | 'tmb'
  | 'calorias'
  | 'macros'
  | 'gordura'
  | 'plano'
  | 'agua'
  | 'fxmax'
  | 'MassaMagro'
  | 'repmax'
  | 'queima';

const components: Record<Aba, React.ReactElement> = {
  imc: <IMCCalculator />,
  tmb: <TMBCalculator />,
  calorias: <CaloricExpenditure />,
  macros: <MacroCalculator />,
  gordura: <BodyFatCalculator />,
  plano: <BulkCutPlanner />,
  agua: <AguaCalculator />,
  fxmax: <FCMaxCalculator />,
  MassaMagro: <MassaMagroCalculator />,
  repmax: <RepMaxCalculator />,
  queima: <QueimaGorduraCalculator />,
};

export default function Academia() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('imc');

  useEffect(() => {
    document.title = 'Fitness';
  }, []);

  // Rótulos para os botões, uniformizando o tamanho via CSS
  const labels: Record<Aba, string> = {
    imc: 'Massa corporal',
    tmb: 'Metabolismo Basal',
    calorias: 'Gasto Calórico',
    macros: 'Macronutrientes',
    gordura: 'Gordura Corporal',
    plano: 'Planejador',
    agua: 'Água',
    fxmax: 'Frequência Cardíaca',
    MassaMagro: 'Massa Magra',
    repmax: 'Repetição Máxima',
    queima: 'Queima de Gordura',
  };

  return (
    <div className="mx-auto h-screen bg-zinc-900 p-4">
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {Object.entries(labels).map(([aba, label]) => (
          <Button
            key={aba}
            variant={abaAtiva === aba ? 'default' : 'outline'}
            onClick={() => setAbaAtiva(aba as Aba)}
            className="max-w-[250px] min-w-[150px] flex-1 text-center"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="transition-all duration-300">{components[abaAtiva]}</div>
    </div>
  );
}
