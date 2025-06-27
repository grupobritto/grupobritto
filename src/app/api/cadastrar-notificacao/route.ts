export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { type CadastroPostBody, type CnjApiResponse, type CnjSource } from '@/lib/types';
import { sendConfirmationEmail } from '@/lib/email'; // Importamos apenas a função de email

// A função fetchProcessoCNJ definida aqui mesmo no arquivo
async function fetchProcessoCNJ(numeroProcesso: string): Promise<CnjSource | null> {
  const getTribunalSlug = (num: string): string | null => {
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
    const regex = /\.8\.(\d{2})\./;
    const match = num.match(regex);
    return match && match[1] ? tribunalSlugMap[match[1]] : null;
  };

  const slug = getTribunalSlug(numeroProcesso);
  if (!slug) throw new Error('Tribunal não identificado ou não suportado no número do processo.');

  const endpoint = `https://api-publica.datajud.cnj.jus.br/api_publica_${slug}/_search`;
  const apiKey = process.env.CNJ_API_PUBLIC_KEY;
  const numeroProcessoSanitizado = numeroProcesso.replace(/\D/g, '');

  if (!apiKey) throw new Error('Chave de API do CNJ não configurada no servidor.');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify({ query: { match_phrase: { numeroProcesso: numeroProcessoSanitizado } } }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as CnjApiResponse;

  return data.hits?.hits?.[0]?._source || null;
}

export async function POST(request: Request) {
  const db = process.env.DB as unknown as D1Database;

  if (!db) {
    console.error('Binding do Banco de Dados D1 não encontrado.');
    return NextResponse.json(
      { message: 'Conexão com o banco de dados não configurada.' },
      { status: 500 },
    );
  }

  try {
    const { email, numeroProcesso } = (await request.json()) as CadastroPostBody;

    if (!email || !numeroProcesso) {
      return NextResponse.json(
        { message: 'Email e número do processo são obrigatórios.' },
        { status: 400 },
      );
    }

    // Chama a função fetchProcessoCNJ que está definida logo acima neste mesmo arquivo
    const processo = await fetchProcessoCNJ(numeroProcesso);
    if (!processo) {
      return NextResponse.json(
        { message: 'Processo não encontrado na base de dados do CNJ. Verifique o número.' },
        { status: 404 },
      );
    }

    const totalMovimentacoesInicial = processo.movimentos?.length || 0;

    const stmt = db
      .prepare(
        `INSERT INTO notificacoes (email, numero_processo, ultimo_total_movimentacoes, data_ultima_verificacao)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(email, numero_processo) DO UPDATE SET
         ultimo_total_movimentacoes=excluded.ultimo_total_movimentacoes,
         data_ultima_verificacao=datetime('now');`,
      )
      .bind(email, numeroProcesso, totalMovimentacoesInicial);

    await stmt.run();

    // Chama a função de envio de email após o sucesso no banco de dados
    await sendConfirmationEmail(email, numeroProcesso);

    return NextResponse.json(
      {
        message:
          'Cadastro realizado com sucesso! Um email de confirmação foi enviado para sua caixa de entrada.',
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('Erro ao cadastrar notificação:', error);

    const message = error instanceof Error ? error.message : 'Ocorreu um erro no servidor.';

    return NextResponse.json({ message }, { status: 500 });
  }
}
