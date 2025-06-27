'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function Senha() {
  const [senha, setSenha] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [gerado, setGerado] = useState(false);

  const [maiuscula, setMaiuscula] = useState(true);
  const [minuscula, setMinuscula] = useState(true);
  const [numero, setNumero] = useState(true);
  const [especial, setEspecial] = useState(false);
  const [tamanho, setTamanho] = useState(8);

  function gerarSenha() {
    const letrasMaiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const especiais = '!@#$%^&*()_+{}[]<>?';

    let caracteres = '';
    if (maiuscula) caracteres += letrasMaiusculas;
    if (minuscula) caracteres += letrasMinusculas;
    if (numero) caracteres += numeros;
    if (especial) caracteres += especiais;

    if (!caracteres) return '';

    let senhaGerada = '';
    for (let i = 0; i < tamanho; i++) {
      const index = Math.floor(Math.random() * caracteres.length);
      senhaGerada += caracteres[index];
    }

    return senhaGerada;
  }

  function handleGerar() {
    const novaSenha = gerarSenha();
    setSenha(novaSenha);
    setGerado(true);
    setCopiado(false);
  }

  function handleCopiar() {
    navigator.clipboard.writeText(senha);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function corSeguranca(valor: number) {
    if (valor < 10) return 'bg-red-500';
    if (valor < 16) return 'bg-yellow-500';
    if (valor < 24) return 'bg-green-500';
    return 'bg-emerald-600';
  }

  return (
    <>
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <div className="mx-auto rounded-lg p-6">
          <div className="flex w-72 flex-col gap-4">
            <Input disabled={!gerado} value={senha} readOnly />

            <div className="text-sm font-medium">
              Comprimento: <span className="font-bold">{tamanho} caracteres</span>
            </div>

            <Slider
              min={6}
              max={32}
              step={1}
              value={[tamanho]}
              onValueChange={([val]) => setTamanho(val)}
              className="relative flex h-6 w-full items-center"
            >
              <div className="bg-muted absolute h-2 w-full rounded-full" />
              <div
                className={`absolute h-2 rounded-full transition-all duration-300 ${corSeguranca(
                  tamanho,
                )}`}
                style={{ width: `${((tamanho - 6) / (32 - 6)) * 100}%` }}
              />
            </Slider>

            <div className="mt-2 flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <Checkbox checked={maiuscula} onCheckedChange={(v) => setMaiuscula(!!v)} />
                Letras maiúsculas
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={minuscula} onCheckedChange={(v) => setMinuscula(!!v)} />
                Letras minúsculas
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={numero} onCheckedChange={(v) => setNumero(!!v)} />
                Números
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={especial} onCheckedChange={(v) => setEspecial(!!v)} />
                Caracteres especiais
              </label>
            </div>

            <Button onClick={handleGerar}>Gerar Senha</Button>

            {gerado && (
              <Button variant="outline" onClick={handleCopiar}>
                {copiado ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copiado ? 'Copiado!' : 'Copiar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
