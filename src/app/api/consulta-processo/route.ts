export const runtime = 'edge';

import { NextResponse } from 'next/server';
// Importamos os tipos necessários
import { type ConsultaPostBody, type CnjApiResponse } from '@/lib/types';

// Mapeamento dos códigos de Tribunal (TR) para o slug da API do CNJ
const tribunalSlugMap: Record<string, string> = {
  '01': 'tjdft',
  '02': 'tjac',
  '03': 'tjal',
  '04': 'tjap',
  '05': 'tjam',
  '06': 'tjba',
  '07': 'tjce',
  '08': 'tjes',
  '09': 'tjgo',
  '10': 'tjma',
  '11': 'tjmt',
  '12': 'tjms',
  '13': 'tjmg',
  '14': 'tjpa',
  '15': 'tjpb',
  '16': 'tjpr',
  '17': 'tjpe',
  '18': 'tjpi',
  '19': 'tjrj',
  '20': 'tjrn',
  '21': 'tjrs',
  '22': 'tjro',
  '23': 'tjrr',
  '24': 'tjsc',
  '25': 'tjse',
  '26': 'tjsp',
  '27': 'tjto',
};

function getTribunalSlug(numeroProcesso: string): string | null {
  const regex = /\.8\.(\d{2})\./;
  const match = numeroProcesso.match(regex);
  if (match && match[1]) {
    return tribunalSlugMap[match[1]] || null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    // CORREÇÃO 1: Definimos o tipo do corpo da requisição.
    const { numeroProcesso } = (await request.json()) as ConsultaPostBody;

    if (!numeroProcesso) {
      return NextResponse.json({ message: 'Número do processo é obrigatório.' }, { status: 400 });
    }

    const slug = getTribunalSlug(numeroProcesso);

    if (!slug) {
      return NextResponse.json(
        { message: 'Tribunal não identificado ou não suportado.' },
        { status: 400 },
      );
    }

    const endpoint = `https://api-publica.datajud.cnj.jus.br/api_publica_${slug}/_search`;
    const apiKey = process.env.CNJ_API_PUBLIC_KEY;

    if (!apiKey) {
      console.error('Chave de API do CNJ não configurada.');
      return NextResponse.json({ message: 'Erro de configuração no servidor.' }, { status: 500 });
    }

    const numeroProcessoSanitizado = numeroProcesso.replace(/\D/g, '');

    const cnjQuery = {
      query: {
        match_phrase: {
          numeroProcesso: numeroProcessoSanitizado,
        },
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify(cnjQuery),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Erro da API do CNJ [${slug}]:`, errorData);
      if (response.status === 404) {
        return NextResponse.json(
          { message: 'Processo não encontrado na base de dados do CNJ.' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { message: `Erro ao consultar o tribunal: ${response.statusText}` },
        { status: response.status },
      );
    }

    // CORREÇÃO 2: Definimos o tipo da resposta da API do CNJ.
    const data = (await response.json()) as CnjApiResponse;

    // Agora o TypeScript sabe que 'data.hits' existe e o código abaixo é seguro.
    if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
      return NextResponse.json(data.hits.hits[0]);
    } else {
      return NextResponse.json({ message: 'Processo não encontrado.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erro interno na API de consulta:', error);
    return NextResponse.json({ message: 'Ocorreu um erro inesperado.' }, { status: 500 });
  }
}
