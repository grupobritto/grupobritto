// src/lib/types.ts

// --- Tipos para Requisições de API ---

// Para a API de cadastro de notificação
export interface CadastroPostBody {
  email: string;
  numeroProcesso: string;
}

// Para a API de consulta simples
export interface ConsultaPostBody {
  numeroProcesso: string;
}

// --- Tipos para Respostas de API ---

// Para a resposta padrão de erro ou mensagem simples das nossas APIs
export interface ApiResponse {
  message: string;
}

// Para a estrutura completa de um resultado de processo vindo da nossa API
// (Baseado na resposta da API do CNJ)
interface Documento {
  idDocumento: string;
  descricao: string;
  tipoDocumento: number;
  movimentoId: string;
}

interface ComplementoTabelado {
  codigo: number;
  valor: number;
  nome: string;
  descricao: string;
}

interface Movimento {
  dataHora: string;
  nome?: string;
  descricao?: string;
  movimentoNacional?: { codigoNacional: number; descricao: string };
  movimentoLocal?: { descricao: string };
  documentos?: Documento[];
  complementosTabelados?: ComplementoTabelado[];
}

export interface CnjSource {
  classe: { codigo: number; nome: string };
  assuntos: { codigo: number; nome: string }[];
  dataAjuizamento: string;
  numeroProcesso: string;
  orgaoJulgador: { codigo: number; nome: string };
  movimentos: Movimento[];
  [key: string]: unknown;
}

export interface ProcessoResult {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: CnjSource;
}

// Para a resposta da API externa do CNJ
export interface CnjApiResponse {
  hits?: {
    hits?: ProcessoResult[];
  };
}
