'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckIcon, ClipboardIcon } from 'lucide-react';
import { useState } from 'react';

const ORGAOS = ['Saúde', 'Educação', 'Obras'];
const VINCULOS = ['Estatutário', 'Contrato Prazo Determ. (RJU)', 'Comissionado'];
const CARGOS = ['Motorista I', 'Motorista II'];
const SITUACOES = ['Trabalhando', 'Licença', 'Demitido'];
const NOMES = ['João', 'Maria', 'Carlos', 'Ana', 'Bruno', 'Juliana', 'Paulo', 'Aline'];
const SOBRENOMES = [
  'Silva',
  'Santos',
  'Oliveira',
  'Costa',
  'Lima',
  'Almeida',
  'Souza',
  'Rodrigues',
];

function formatarData(date: Date): string {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function gerarDataAdmissao(): string {
  const ano = Math.floor(Math.random() * 10) + 2010;
  const mes = Math.floor(Math.random() * 12);
  const dia = Math.floor(Math.random() * 28) + 1;
  return formatarData(new Date(ano, mes, dia));
}

function gerarValidadeCNH(): string {
  const ano = Math.floor(Math.random() * 5) + 2024;
  const mes = Math.floor(Math.random() * 12);
  const dia = Math.floor(Math.random() * 28) + 1;
  return formatarData(new Date(ano, mes, dia));
}

function gerarNomeCompleto(): string {
  const nome = NOMES[Math.floor(Math.random() * NOMES.length)];
  const sobrenome1 = SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)];
  const sobrenome2 = SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)];
  return `${nome} ${sobrenome1} ${sobrenome2}`;
}

function gerarRegistro() {
  return {
    nome: gerarNomeCompleto(),
    orgao: ORGAOS[Math.floor(Math.random() * ORGAOS.length)],
    admissao: gerarDataAdmissao(),
    matricula: (Math.floor(Math.random() * 900000) + 100000).toString(),
    vinculo: VINCULOS[Math.floor(Math.random() * VINCULOS.length)],
    cargaMensal: (Math.floor(Math.random() * 121) + 80).toString(),
    cargaSemanal: (Math.floor(Math.random() * 40) + 1).toString(),
    cargo: CARGOS[Math.floor(Math.random() * CARGOS.length)],
    situacao: SITUACOES[Math.floor(Math.random() * SITUACOES.length)],
    carteira: Math.floor(Math.random() * 90000000000 + 10000000000).toString(),
    validade: gerarValidadeCNH(),
  };
}

export default function Json() {
  const [quantidade, setQuantidade] = useState(10);
  const [resultado, setResultado] = useState('');
  const [copiado, setCopiado] = useState(false);

  const gerar = () => {
    const dados = Array.from({ length: quantidade }, gerarRegistro);
    const json = JSON.stringify(dados, null, 2);
    setResultado(json);
    setCopiado(false);
  };

  const copiar = async () => {
    await navigator.clipboard.writeText(resultado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
          <Card className="border-none">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor="quantidade" className="mb-2">
                    Quantidade de registros
                  </Label>
                  <Input
                    id="quantidade"
                    type="text"
                    min={1}
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end sm:justify-end">
                  <Button
                    onClick={gerar}
                    className="w-full hover:bg-(--color-highlight) hover:text-white sm:w-auto"
                  >
                    Gerar JSON
                  </Button>
                  {resultado && (
                    <Button
                      onClick={copiar}
                      variant="secondary"
                      className="flex w-full items-center gap-2 hover:bg-(--color-highlight) hover:text-white sm:w-auto"
                    >
                      {copiado ? <CheckIcon /> : <ClipboardIcon />}
                      {copiado ? 'Copiado!' : 'Copiar JSON'}
                    </Button>
                  )}
                </div>
              </div>

              {resultado && (
                <div className="space-y-2">
                  <div className="flex justify-end"></div>

                  <Textarea
                    className="max-h-100 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700"
                    readOnly
                    value={resultado}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
