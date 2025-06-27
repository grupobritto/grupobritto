// src/lib/tribunalUtils.ts - CÓDIGO COMPLETO PARA SUBSTITUIÇÃO

import { limparNumeroProcesso } from '@/lib/utils';

export interface TribunalInfo {
  code: string;
  name: string;
  initials: string;
  flagUrl: string;
}

const tribunaisEstaduais: Record<string, Omit<TribunalInfo, 'code'>> = {
  '01': { name: 'TJDFT - Distrito Federal', initials: 'DF', flagUrl: '/flags/br-df.png' },
  '02': { name: 'TJAC - Acre', initials: 'AC', flagUrl: '/flags/br-ac.png' },
  '03': { name: 'TJAL - Alagoas', initials: 'AL', flagUrl: '/flags/br-al.png' },
  '04': { name: 'TJAP - Amapá', initials: 'AP', flagUrl: '/flags/br-ap.png' },
  '05': { name: 'TJAM - Amazonas', initials: 'AM', flagUrl: '/flags/br-am.png' },
  '06': { name: 'TJBA - Bahia', initials: 'BA', flagUrl: '/flags/br-ba.png' },
  '07': { name: 'TJCE - Ceará', initials: 'CE', flagUrl: '/flags/br-ce.png' },
  '08': { name: 'TJES - Espírito Santo', initials: 'ES', flagUrl: '/flags/br-es.png' },
  '09': { name: 'TJGO - Goiás', initials: 'GO', flagUrl: '/flags/br-go.png' },
  '10': { name: 'TJMA - Maranhão', initials: 'MA', flagUrl: '/flags/br-ma.png' },
  '11': { name: 'TJMT - Mato Grosso', initials: 'MT', flagUrl: '/flags/br-mt.png' },
  '12': { name: 'TJMS - Mato Grosso do Sul', initials: 'MS', flagUrl: '/flags/br-ms.png' },
  '13': { name: 'TJMG - Minas Gerais', initials: 'MG', flagUrl: '/flags/br-mg.png' },
  '14': { name: 'TJPA - Pará', initials: 'PA', flagUrl: '/flags/br-pa.png' },
  '15': { name: 'TJPB - Paraíba', initials: 'PB', flagUrl: '/flags/br-pb.png' },
  '16': { name: 'TJPR - Paraná', initials: 'PR', flagUrl: '/flags/br-pr.png' },
  '17': { name: 'TJPE - Pernambuco', initials: 'PE', flagUrl: '/flags/br-pe.png' },
  '18': { name: 'TJPI - Piauí', initials: 'PI', flagUrl: '/flags/br-pi.png' },
  '19': { name: 'TJRJ - Rio de Janeiro', initials: 'RJ', flagUrl: '/flags/br-rj.png' },
  '20': { name: 'TJRN - Rio Grande do Norte', initials: 'RN', flagUrl: '/flags/br-rn.png' },
  '21': { name: 'TJRS - Rio Grande do Sul', initials: 'RS', flagUrl: '/flags/br-rs.png' },
  '22': { name: 'TJRO - Rondônia', initials: 'RO', flagUrl: '/flags/br-ro.png' },
  '23': { name: 'TJRR - Roraima', initials: 'RR', flagUrl: '/flags/br-rr.png' },
  '24': { name: 'TJSC - Santa Catarina', initials: 'SC', flagUrl: '/flags/br-sc.png' },
  '25': { name: 'TJSE - Sergipe', initials: 'SE', flagUrl: '/flags/br-se.png' },
  '26': { name: 'TJSP - São Paulo', initials: 'SP', flagUrl: '/flags/br-sp.png' },
  '27': { name: 'TJTO - Tocantins', initials: 'TO', flagUrl: '/flags/br-to.png' },
};

const justicaFederalNacional: Omit<TribunalInfo, 'code'> = {
  name: 'Justiça Federal ou Superior',
  initials: 'BR',
  flagUrl: '/flags/br.webp',
};

// Movido de page.tsx para cá
const courtUrlMap: Record<string, { name: string; url: string }> = {
  '24': {
    name: 'EPROC TJSC',
    url: 'https://eprocwebcon.tjsc.jus.br/consulta1g/externo_controlador.php?acao=processo_consulta_publica&txtNumProcesso={proc}',
  },
  '21': {
    name: 'EPROC TJRS',
    url: 'https://www.tjrs.jus.br/novo/buscas-publicas/consulta-processual-unificada/?numero_processo={proc}',
  },
  '26': {
    name: 'e-SAJ TJSP',
    url: 'https://esaj.tjsp.jus.br/cpopg/search.do?cbPesquisa=NUMPROC&dePesquisa={proc}',
  },
  // Adicionar outros tribunais conforme necessário
};

/**
 * Extrai informações do tribunal a partir do número do processo no formato CNJ,
 * seja ele formatado ou sem máscara.
 * * @param numeroProcesso - Número do processo, formatado ou não.
 * @returns TribunalInfo ou null se não identificar.
 */
export function getTribunalInfo(numeroProcesso: string): TribunalInfo | null {
  const somenteDigitos = limparNumeroProcesso(numeroProcesso);

  if (somenteDigitos.length !== 20) {
    return null;
  }

  // Posições fixas na estrutura CNJ:
  // NNNNNNN-DD AAAA J TR OOOO
  const justica = somenteDigitos.slice(13, 14); // Posição 14
  const tribunal = somenteDigitos.slice(14, 16); // Posição 15-16

  // Justiça Estadual
  if (justica === '8') {
    const info = tribunaisEstaduais[tribunal];
    if (info) {
      return { code: tribunal, ...info };
    }
  }

  // Justiça Federal, TRT, TRE, STJ, STF, STM, etc
  if (['1', '2', '3', '4', '5', '6'].includes(justica)) {
    return { code: tribunal, ...justicaFederalNacional };
  }

  return null;
}

/**
 * Gera a URL para consulta externa do processo em um tribunal específico.
 * Se o tribunal não for mapeado, retorna uma busca no Google.
 * * @param numeroProcesso - O número do processo a ser consultado.
 * @returns Um objeto com a URL e o nome do tribunal/serviço.
 */
export const getCourtExternalUrl = (numeroProcesso: string): { url: string; name: string } => {
  const sanitizedProc = limparNumeroProcesso(numeroProcesso);
  const match = numeroProcesso.match(/\.8\.(\d{2})\./);
  const courtCode = match ? match[1] : null;

  if (courtCode && courtUrlMap[courtCode]) {
    return {
      url: courtUrlMap[courtCode].url.replace('{proc}', sanitizedProc),
      name: courtUrlMap[courtCode].name,
    };
  }
  return {
    url: `https://www.google.com/search?q=processo+${sanitizedProc}`,
    name: 'Buscar no Google',
  };
};
