import { Resend } from 'resend';

interface CnjMovimento {
  dataHora: string;
  movimentoNacional?: { descricao: string };
  nome?: string;
  descricao?: string;
  movimentoLocal?: { descricao: string };
}
interface CnjSource {
  movimentos?: CnjMovimento[];
  [key: string]: any;
}
interface CnjHit {
  _source: CnjSource;
}
interface CnjApiResponse {
  hits?: { hits?: CnjHit[] };
}

export interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  CNJ_API_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
}

interface Notificacao {
  id: number;
  email: string;
  numero_processo: string;
  ultimo_total_movimentacoes: number;
  // Adicionar campos de backup/importação
  etiqueta_nome?: string | null;
  etiqueta_prioridade?: string | null;
  favorito: 0 | 1;
  ultima_movimentacao_data?: string | null; // Adicionado para uso na importação/bulk-add
  ultima_movimentacao_descricao?: string | null; // Adicionado para uso na importação/bulk-add
}

// --- FUNÇÕES AUXILIARES ---
async function fetchProcessoCNJ(numeroProcesso: string, env: Env): Promise<CnjSource | null> {
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
    return match ? tribunalSlugMap[match[1]] : null;
  };
  const slug = getTribunalSlug(numeroProcesso);
  if (!slug) {
    console.error(`Tribunal não identificado ou formato inválido para ${numeroProcesso}`);
    return null;
  }
  const endpoint = `https://api-publica.datajud.cnj.jus.br/api_publica_${slug}/_search`;
  const apiKey = env.CNJ_API_PUBLIC_KEY;
  const numeroProcessoSanitizado = numeroProcesso.replace(/\D/g, '');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify({ query: { match_phrase: { numeroProcesso: numeroProcessoSanitizado } } }),
  });
  if (!response.ok) return null;
  const data = await response.json<CnjApiResponse>();
  return data.hits?.hits?.[0]?._source || null;
}

async function verificarEnotificar(
  notificacao: Notificacao,
  env: Env,
  isPrimeiraVerificacao = false,
) {
  const resend = new Resend(env.RESEND_API_KEY);
  const processoAtual = await fetchProcessoCNJ(notificacao.numero_processo, env);
  if (!processoAtual || !processoAtual.movimentos) {
    console.log(`Dados do CNJ indisponíveis para ${notificacao.numero_processo}.`);
    // Se não houver movimentos, ainda podemos querer atualizar a data da última verificação.
    await env.DB.prepare(
      "UPDATE notificacoes SET data_ultima_verificacao = datetime('now') WHERE id = ?",
    )
      .bind(notificacao.id)
      .run();
    return;
  }

  const movimentosAtuais = processoAtual.movimentos.sort(
    (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
  );
  const totalAtual = movimentosAtuais.length;

  const houveNovaMovimentacao = totalAtual > notificacao.ultimo_total_movimentacoes;
  const destinatarios = [notificacao.email].filter((e): e is string => !!e);

  let subject: string = '';
  let htmlBody: string = '';

  if (isPrimeiraVerificacao) {
    subject = `[JusCheck] Processo ${notificacao.numero_processo} adicionado ao monitoramento`;
    htmlBody = `<p>Olá!</p><p>O processo <strong>${notificacao.numero_processo}</strong> foi adicionado com sucesso ao seu monitoramento.</p><p>A partir de agora, você será notificado sobre qualquer nova movimentação.</p>`;
  } else if (houveNovaMovimentacao) {
    const numNovasMovimentacoes = totalAtual - notificacao.ultimo_total_movimentacoes;
    const novasMovimentacoes = movimentosAtuais.slice(0, numNovasMovimentacoes);

    await Promise.all(
      novasMovimentacoes.map((m) =>
        env.DB.prepare(
          'INSERT INTO movimentacoes_historico (processo_id, data_movimentacao, descricao) VALUES (?, ?, ?)',
        )
          .bind(
            notificacao.id,
            m.dataHora,
            m.movimentoNacional?.descricao || m.nome || m.descricao || 'N/A',
          )
          .run(),
      ),
    );

    const ultimaMovimentacao = novasMovimentacoes[0];
    const descUltimaMov =
      ultimaMovimentacao.movimentoNacional?.descricao ||
      ultimaMovimentacao.nome ||
      ultimaMovimentacao.descricao ||
      'Movimentação';

    subject = `[JusCheck] Nova movimentação em ${notificacao.numero_processo}: ${descUltimaMov}`;
    const detalhesEmail = novasMovimentacoes
      .map((m) => {
        const desc = m.movimentoNacional?.descricao || m.nome || m.descricao || 'Movimentação';
        const data = new Date(m.dataHora).toLocaleString('pt-BR');
        return `<li><strong>${desc}</strong> (em ${data})</li>`;
      })
      .join('');
    htmlBody = `<p>Olá!</p><p>Detectamos <strong>${numNovasMovimentacoes} nova(s) movimentação(ões)</strong> no processo <strong>${notificacao.numero_processo}</strong>:</p><ul>${detalhesEmail}</ul><p>Acesse o portal do tribunal ou o dashboard do JusCheck para mais detalhes.</p>`;
  }
  // else { // Removido este bloco else para permitir que a atualização da última movimentação ocorra sempre
  //     await env.DB.prepare("UPDATE notificacoes SET data_ultima_verificacao = datetime('now') WHERE id = ?").bind(notificacao.id).run();
  //     return;
  // }

  // NOTIFICAÇÃO POR E-MAIL E REGISTRO DE ALERTA: SOMENTE SE HOUVE NOVA MOVIMENTAÇÃO OU É PRIMEIRA VERIFICAÇÃO
  if (
    (isPrimeiraVerificacao || houveNovaMovimentacao) &&
    destinatarios.length > 0 &&
    htmlBody &&
    subject
  ) {
    await resend.emails.send({
      from: 'Notificações JusCheck <noreply@grupobritto.com.br>',
      to: destinatarios,
      subject: subject,
      html: htmlBody,
    });
    await env.DB.prepare(
      'INSERT INTO alertas_historico (notificacao_id, processo_id, detalhes) VALUES (?, ?, ?)',
    )
      .bind(notificacao.id, notificacao.id, htmlBody)
      .run();
  }

  // ATUALIZAÇÃO DOS DADOS DO PROCESSO: SEMPRE QUE MOVIMENTAÇÕES SÃO BUSCADAS COM SUCESSO
  // Garantir que a última movimentação e a data de verificação sejam atualizadas
  const ultimaMovimentacao = movimentosAtuais[0];
  if (ultimaMovimentacao) {
    // Se houver pelo menos uma movimentação encontrada
    await env.DB.prepare(
      "UPDATE notificacoes SET ultimo_total_movimentacoes = ?, data_ultima_verificacao = datetime('now'), ultima_movimentacao_data = ?, ultima_movimentacao_descricao = ? WHERE id = ?",
    )
      .bind(
        totalAtual,
        ultimaMovimentacao.dataHora,
        ultimaMovimentacao.movimentoNacional?.descricao ||
          ultimaMovimentacao.nome ||
          ultimaMovimentacao.descricao,
        notificacao.id,
      )
      .run();
  } else {
    // Se não houver movimentações, apenas atualiza o total e a data de verificação
    await env.DB.prepare(
      "UPDATE notificacoes SET ultimo_total_movimentacoes = ?, data_ultima_verificacao = datetime('now') WHERE id = ?",
    )
      .bind(totalAtual, notificacao.id)
      .run();
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Rota: GET /api/processos - Listar todos os processos
      if (path === '/api/processos' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT n.*, h.ultima_notificacao FROM notificacoes n LEFT JOIN (SELECT notificacao_id, MAX(timestamp) as ultima_notificacao FROM alertas_historico GROUP BY notificacao_id) h ON n.id = h.notificacao_id ORDER BY n.favorito DESC, n.criado_em DESC;',
        ).all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Rota: GET /api/processos/export - Exportar processos
      if (path === '/api/processos/export' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT numero_processo, email, etiqueta_nome, etiqueta_prioridade, favorito FROM notificacoes',
        ).all<Notificacao>();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Rota: POST /api/processos/import - Importar processos
      if (path === '/api/processos/import' && request.method === 'POST') {
        const processesToImport: Notificacao[] = await request.json();
        if (!Array.isArray(processesToImport) || processesToImport.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Nenhum processo fornecido para importação.' }),
            { status: 400, headers: corsHeaders },
          );
        }

        const importResults: { success: boolean; numero_processo: string; error?: string }[] = [];
        const processesToRecheck: Notificacao[] = []; // Coletar processos que foram inseridos ou atualizados

        for (const p of processesToImport) {
          try {
            // Tenta inserir ou obter o ID do processo existente para a verificação posterior
            const existingProcess = await env.DB.prepare(
              'SELECT id FROM notificacoes WHERE numero_processo = ? AND email = ?',
            )
              .bind(p.numero_processo, p.email)
              .first<{ id: number } | null>();

            const stmt = env.DB.prepare(
              // Agora incluímos os campos ultima_movimentacao_data e ultima_movimentacao_descricao no INSERT/UPDATE
              // E no COALESCE usamos os valores do backup se existirem, senão NULL
              `INSERT INTO notificacoes (numero_processo, email, etiqueta_nome, etiqueta_prioridade, favorito, ultimo_total_movimentacoes, data_ultima_verificacao, ultima_movimentacao_data, ultima_movimentacao_descricao)
                             VALUES (?, ?, ?, ?, ?, COALESCE((SELECT ultimo_total_movimentacoes FROM notificacoes WHERE numero_processo = ? AND email = ?), 0), COALESCE((SELECT data_ultima_verificacao FROM notificacoes WHERE numero_processo = ? AND email = ?), datetime('now')), COALESCE(?, NULL), COALESCE(?, NULL))
                             ON CONFLICT(email, numero_processo) DO UPDATE SET
                               etiqueta_nome = EXCLUDED.etiqueta_nome,
                               etiqueta_prioridade = EXCLUDED.etiqueta_prioridade,
                               favorito = EXCLUDED.favorito,
                               ultima_movimentacao_data = COALESCE(EXCLUDED.ultima_movimentacao_data, ultima_movimentacao_data),
                               ultima_movimentacao_descricao = COALESCE(EXCLUDED.ultima_movimentacao_descricao, ultima_movimentacao_descricao);`,
            );
            // No bind, precisamos passar os valores para os COALESCEs
            await stmt
              .bind(
                p.numero_processo,
                p.email,
                p.etiqueta_nome || null,
                p.etiqueta_prioridade || 'Não definido',
                p.favorito ? 1 : 0,
                p.numero_processo,
                p.email, // para o primeiro COALESCE (ultimo_total_movimentacoes)
                p.numero_processo,
                p.email, // para o segundo COALESCE (data_ultima_verificacao)
                p.ultima_movimentacao_data || null, // Valor da ultima_movimentacao_data do backup, se houver
                p.ultima_movimentacao_descricao || null, // Valor da ultima_movimentacao_descricao do backup, se houver
              )
              .run();

            // Se o processo for novo ou tiver sido atualizado, agendamos uma verificação.
            // Para pegar o ID do processo recém-inserido ou existente, fazemos uma nova consulta.
            const insertedOrUpdatedProcess = await env.DB.prepare(
              'SELECT * FROM notificacoes WHERE numero_processo = ? AND email = ?',
            )
              .bind(p.numero_processo, p.email)
              .first<Notificacao>();
            if (insertedOrUpdatedProcess) {
              processesToRecheck.push(insertedOrUpdatedProcess);
            }

            importResults.push({ success: true, numero_processo: p.numero_processo });
          } catch (error: any) {
            console.error(`Erro ao importar processo ${p.numero_processo}:`, error.message);
            importResults.push({
              success: false,
              numero_processo: p.numero_processo,
              error: error.message,
            });
          }
        }
        // Após importar, agendamos a verificação para os processos que foram adicionados/atualizados
        if (processesToRecheck.length > 0) {
          console.log(
            `Agendando verificação para ${processesToRecheck.length} processos importados/atualizados.`,
          );
          ctx.waitUntil(
            Promise.all(processesToRecheck.map((n) => verificarEnotificar(n, env, false))),
          );
        }

        return new Response(JSON.stringify(importResults), { status: 200, headers: corsHeaders });
      }

      // NOVA ROTA: DELETE /api/processos - Remover um ou mais processos por IDs
      if (path === '/api/processos' && request.method === 'DELETE') {
        const idsParam = url.searchParams.get('ids');
        if (!idsParam) {
          return new Response(
            JSON.stringify({ error: 'IDs de processo são obrigatórios para exclusão.' }),
            { status: 400, headers: corsHeaders },
          );
        }
        const idsToDelete = idsParam
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));
        if (idsToDelete.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Nenhum ID de processo válido fornecido para exclusão.' }),
            { status: 400, headers: corsHeaders },
          );
        }

        // Cria uma string de placeholders (?) para a consulta SQL
        const placeholders = idsToDelete.map(() => '?').join(',');

        // Executa a exclusão
        const stmt = env.DB.prepare(`DELETE FROM notificacoes WHERE id IN (${placeholders})`);
        await stmt.bind(...idsToDelete).run();

        return new Response(
          JSON.stringify({
            success: true,
            message: `${idsToDelete.length} processo(s) removido(s) com sucesso.`,
          }),
          { status: 200, headers: corsHeaders },
        );
      }

      // NOVA ROTA: POST /api/monitor/force-check-all - Forçar verificação de todos os processos
      if (path === '/api/monitor/force-check-all' && request.method === 'POST') {
        try {
          const { results } = await env.DB.prepare('SELECT * FROM notificacoes').all<Notificacao>();
          if (results && results.length > 0) {
            console.log(
              `Verificação manual: Encontrados ${results.length} processos para verificar.`,
            );
            // Usa Promise.all para executar verificações em paralelo.
            // ctx.waitUntil para que o worker não termine antes das promessas.
            ctx.waitUntil(Promise.all(results.map((n) => verificarEnotificar(n, env, false))));
            return new Response(
              JSON.stringify({
                success: true,
                message: `Verificação de ${results.length} processos iniciada.`,
              }),
              { status: 200, headers: corsHeaders },
            );
          } else {
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Nenhum processo cadastrado para verificar.',
              }),
              { status: 200, headers: corsHeaders },
            );
          }
        } catch (error: any) {
          console.error(
            'Erro ao forçar verificação de todos os processos:',
            error.message,
            error.stack,
          );
          return new Response(
            JSON.stringify({ error: 'Erro interno ao tentar forçar a verificação de processos.' }),
            { status: 500, headers: corsHeaders },
          );
        }
      }

      // NOVA ROTA: POST /api/monitor/force-check-bulk - Forçar verificação de processos selecionados
      if (path === '/api/monitor/force-check-bulk' && request.method === 'POST') {
        try {
          const { ids } = await request.json<{ ids: number[] }>();
          if (!ids || ids.length === 0) {
            return new Response(
              JSON.stringify({
                error: 'IDs de processo são obrigatórios para a verificação em lote.',
              }),
              { status: 400, headers: corsHeaders },
            );
          }

          // Cria placeholders para a consulta SQL
          const placeholders = ids.map(() => '?').join(',');
          const { results } = await env.DB.prepare(
            `SELECT * FROM notificacoes WHERE id IN (${placeholders})`,
          )
            .bind(...ids)
            .all<Notificacao>();

          if (results && results.length > 0) {
            console.log(
              `Verificação em lote: Encontrados ${results.length} processos para verificar.`,
            );
            ctx.waitUntil(Promise.all(results.map((n) => verificarEnotificar(n, env, false))));
            return new Response(
              JSON.stringify({
                success: true,
                message: `Verificação de ${results.length} processo(s) selecionado(s) iniciada.`,
              }),
              { status: 200, headers: corsHeaders },
            );
          } else {
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Nenhum processo selecionado encontrado para verificar.',
              }),
              { status: 200, headers: corsHeaders },
            );
          }
        } catch (error: any) {
          console.error(
            'Erro ao forçar verificação em lote de processos:',
            error.message,
            error.stack,
          );
          return new Response(
            JSON.stringify({
              error: 'Erro interno ao tentar forçar a verificação em lote de processos.',
            }),
            { status: 500, headers: corsHeaders },
          );
        }
      }

      // Rota: POST /api/processos - Adicionar um novo processo (individual)
      if (path === '/api/processos' && request.method === 'POST') {
        const body: any = await request.json();
        const { numero_processo, email, etiqueta_nome, etiqueta_prioridade, notificar_email } =
          body;
        if (!numero_processo || !email)
          return new Response(JSON.stringify({ error: 'Dados incompletos.' }), {
            status: 400,
            headers: corsHeaders,
          });
        const processoCNJ = await fetchProcessoCNJ(numero_processo, env);
        if (!processoCNJ)
          return new Response(JSON.stringify({ error: 'Processo não encontrado no CNJ.' }), {
            status: 404,
            headers: corsHeaders,
          });
        const totalMovimentacoesInicial = processoCNJ.movimentos?.length || 0;
        const ultimaMovimentacao = processoCNJ.movimentos?.length
          ? processoCNJ.movimentos.sort(
              (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
            )[0]
          : null;

        const newRecord = await env.DB.prepare(
          "INSERT INTO notificacoes (numero_processo, email, ultimo_total_movimentacoes, data_ultima_verificacao, etiqueta_nome, etiqueta_prioridade, ultima_movimentacao_data, ultima_movimentacao_descricao, favorito) VALUES (?, ?, ?, datetime('now'), ?, ?, ?, ?, 0) RETURNING *",
        )
          .bind(
            numero_processo,
            email,
            totalMovimentacoesInicial,
            etiqueta_nome || null,
            etiqueta_prioridade || 'Não definido',
            ultimaMovimentacao?.dataHora,
            ultimaMovimentacao
              ? ultimaMovimentacao.movimentoNacional?.descricao || ultimaMovimentacao.nome
              : null,
          )
          .first<Notificacao>();

        if (newRecord && notificar_email) {
          ctx.waitUntil(verificarEnotificar(newRecord, env, true));
        }
        return new Response(JSON.stringify(newRecord), { status: 201, headers: corsHeaders });
      }

      // NOVA ROTA: POST /api/processos/bulk-add - Adicionar múltiplos processos
      if (path === '/api/processos/bulk-add' && request.method === 'POST') {
        const processosParaAdicionar: {
          numero_processo: string;
          email: string;
          etiqueta_nome?: string;
          etiqueta_prioridade?: string;
          notificar_email?: boolean;
        }[] = await request.json();

        if (!Array.isArray(processosParaAdicionar) || processosParaAdicionar.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Nenhum processo fornecido para adição em massa.' }),
            { status: 400, headers: corsHeaders },
          );
        }

        const results: {
          success: boolean;
          numero_processo: string;
          error?: string;
          newRecord?: Notificacao | null;
        }[] = [];
        const notificationPromises: Promise<void>[] = [];

        for (const processo of processosParaAdicionar) {
          const { numero_processo, email, etiqueta_nome, etiqueta_prioridade, notificar_email } =
            processo;
          if (!numero_processo || !email) {
            results.push({
              success: false,
              numero_processo,
              error: 'Dados incompletos para um dos processos.',
            });
            continue;
          }

          try {
            const processoCNJ = await fetchProcessoCNJ(numero_processo, env);
            if (!processoCNJ) {
              results.push({
                success: false,
                numero_processo,
                error: 'Processo não encontrado no CNJ.',
              });
              continue;
            }
            const totalMovimentacoesInicial = processoCNJ.movimentos?.length || 0;
            const ultimaMovimentacao = processoCNJ.movimentos?.length
              ? processoCNJ.movimentos.sort(
                  (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
                )[0]
              : null;

            const newRecord = await env.DB.prepare(
              "INSERT INTO notificacoes (numero_processo, email, ultimo_total_movimentacoes, data_ultima_verificacao, etiqueta_nome, etiqueta_prioridade, ultima_movimentacao_data, ultima_movimentacao_descricao, favorito) VALUES (?, ?, ?, datetime('now'), ?, ?, ?, ?, 0) RETURNING *",
            )
              .bind(
                numero_processo,
                email,
                totalMovimentacoesInicial,
                etiqueta_nome || null,
                etiqueta_prioridade || 'Não definido',
                ultimaMovimentacao?.dataHora,
                ultimaMovimentacao
                  ? ultimaMovimentacao.movimentoNacional?.descricao || ultimaMovimentacao.nome
                  : null,
              )
              .first<Notificacao>();

            results.push({ success: true, numero_processo, newRecord });

            if (newRecord && notificar_email) {
              notificationPromises.push(verificarEnotificar(newRecord, env, true));
            }
          } catch (error: any) {
            console.error(`Erro ao adicionar processo ${numero_processo}:`, error.message);
            results.push({ success: false, numero_processo, error: error.message });
          }
        }

        // Espera por todas as notificações de forma assíncrona, sem bloquear a resposta da API
        if (notificationPromises.length > 0) {
          ctx.waitUntil(Promise.all(notificationPromises));
        }

        return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
      }

      // Rota: PUT /api/processos/:id - Editar um processo
      const editMatch = path.match(/^\/api\/processos\/(\d+)$/);
      if (editMatch && request.method === 'PUT') {
        const processoId = editMatch[1];
        const { email, etiqueta_nome, etiqueta_prioridade } = await request.json<any>();
        if (!email)
          return new Response(JSON.stringify({ error: 'Email é obrigatório.' }), {
            status: 400,
            headers: corsHeaders,
          });

        await env.DB.prepare(
          'UPDATE notificacoes SET email = ?, etiqueta_nome = ?, etiqueta_prioridade = ? WHERE id = ?',
        )
          .bind(email, etiqueta_nome || null, etiqueta_prioridade || 'Não definido', processoId)
          .run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // Rota: PUT /api/processos/:id/favorito - Favoritar um processo
      const favoritoMatch = path.match(/^\/api\/processos\/(\d+)\/favorito$/);
      if (favoritoMatch && request.method === 'PUT') {
        const processoId = favoritoMatch[1];
        const { favorito } = await request.json<{ favorito: boolean }>();
        await env.DB.prepare('UPDATE notificacoes SET favorito = ? WHERE id = ?')
          .bind(favorito ? 1 : 0, processoId)
          .run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // Rota: POST /api/processos/:id/resend-confirmation - Reenviar e-mail de confirmação
      const resendConfirmationMatch = path.match(/^\/api\/processos\/(\d+)\/resend-confirmation$/);
      if (resendConfirmationMatch && request.method === 'POST') {
        const processoId = resendConfirmationMatch[1];
        const notificacao = await env.DB.prepare('SELECT * FROM notificacoes WHERE id = ?')
          .bind(processoId)
          .first<Notificacao>();

        if (!notificacao) {
          return new Response(JSON.stringify({ error: 'Notificação não encontrada.' }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        ctx.waitUntil(verificarEnotificar(notificacao, env, true)); // Reenvia como primeira verificação
        return new Response(
          JSON.stringify({
            success: true,
            message: 'E-mail de confirmação reenviado com sucesso.',
          }),
          { headers: corsHeaders },
        );
      }

      // Rota: GET /api/dashboard-metrics - Obter métricas do dashboard
      if (path === '/api/dashboard-metrics' && request.method === 'GET') {
        const daysParam = url.searchParams.get('days') || '7';
        const days = parseInt(daysParam, 10);
        if (![7, 15, 30].includes(days))
          return new Response(JSON.stringify({ error: 'Intervalo de dias inválido.' }), {
            status: 400,
            headers: corsHeaders,
          });
        const dateModifier = `-${days} days`;
        const [totalResult, novosResult, movimentacoesResult, prioridadesResult, atividadeResult] =
          await Promise.all([
            env.DB.prepare('SELECT COUNT(*) as total FROM notificacoes').first<{ total: number }>(),
            env.DB.prepare(
              "SELECT COUNT(*) as total FROM notificacoes WHERE criado_em >= date('now', ?)",
            )
              .bind(dateModifier)
              .first<{ total: number }>(),
            env.DB.prepare(
              "SELECT COUNT(*) as total FROM movimentacoes_historico WHERE timestamp_descoberta >= date('now', ?)",
            )
              .bind(dateModifier)
              .first<{ total: number }>(),
            env.DB.prepare(
              'SELECT lower(etiqueta_prioridade) as name, COUNT(*) as value FROM notificacoes GROUP BY lower(etiqueta_prioridade)',
            ).all<{ name: string; value: number }>(),
            env.DB.prepare(
              "SELECT strftime('%Y-%m-%d', timestamp_descoberta) as day, COUNT(*) as count FROM movimentacoes_historico WHERE timestamp_descoberta >= date('now', ?) GROUP BY day ORDER BY day ASC",
            )
              .bind(dateModifier)
              .all<{ day: string; count: number }>(),
          ]);
        const totalAnterior = (totalResult?.total || 0) - (novosResult?.total || 0);
        const metrics = {
          totalProcessos: totalResult?.total || 0,
          novosProcessos: novosResult?.total || 0,
          novasMovimentacoes: movimentacoesResult?.total || 0,
          totalProcessosPeriodoAnterior: totalAnterior < 0 ? 0 : totalAnterior,
          prioridades: prioridadesResult?.results || [],
          atividadeDiaria: atividadeResult?.results || [],
        };
        return new Response(JSON.stringify(metrics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Endpoint não encontrado.', { status: 404, headers: corsHeaders });
    } catch (e: any) {
      console.error('ERRO GERAL NO WORKER:', e.message, e.stack);
      return new Response(JSON.stringify({ error: 'Erro interno no servidor.' }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      console.log('Iniciando verificação agendada de processos...');
      const { results } = await env.DB.prepare('SELECT * FROM notificacoes').all<Notificacao>();

      if (results && results.length > 0) {
        console.log(`Encontrados ${results.length} processos para verificar.`);
        const promises = results.map((n) => verificarEnotificar(n, env, false));
        await Promise.all(promises);
        console.log('Verificação agendada concluída com sucesso.');
      } else {
        console.log('Nenhum processo cadastrado para verificação.');
      }
    } catch (error) {
      console.error('Erro fatal durante a execução do Cron Job:', error);
    }
  },
};
