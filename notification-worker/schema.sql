-- Apaga as tabelas existentes para garantir um schema limpo.
-- CUIDADO: Isso removerá todos os dados existentes.
DROP TABLE IF EXISTS movimentacoes_historico;
DROP TABLE IF EXISTS alertas_historico;
DROP TABLE IF EXISTS push_subscriptions;
DROP TABLE IF EXISTS notificacoes;

-- recria a tabela de notificações com todas as colunas necessárias
CREATE TABLE notificacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  numero_processo TEXT NOT NULL,
  ultimo_total_movimentacoes INTEGER NOT NULL DEFAULT 0,
  data_ultima_verificacao TEXT,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  ultima_verificacao_manual TEXT,
  etiqueta_nome TEXT,
  etiqueta_prioridade TEXT DEFAULT 'Não definido',
  ultima_movimentacao_data TEXT,
  ultima_movimentacao_descricao TEXT,
  favorito INTEGER DEFAULT 0,
  user_id TEXT -- Para associar a um usuário, se necessário no futuro
);

-- Tabela para armazenar as subscrições de push notifications
CREATE TABLE push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notificacao_id INTEGER,
    subscription TEXT NOT NULL,
    FOREIGN KEY (notificacao_id) REFERENCES notificacoes(id) ON DELETE CASCADE
);

-- recria o índice para garantir a unicidade do par email/processo
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_processo ON notificacoes (email, numero_processo);

-- Tabela para o histórico de alertas enviados
CREATE TABLE alertas_historico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notificacao_id INTEGER,
  processo_id INTEGER,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  detalhes TEXT NOT NULL,
  FOREIGN KEY (notificacao_id) REFERENCES notificacoes (id) ON DELETE CASCADE,
  FOREIGN KEY (processo_id) REFERENCES notificacoes (id) ON DELETE CASCADE
);

-- Tabela para rastrear cada movimentação individualmente para métricas precisas
CREATE TABLE movimentacoes_historico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  processo_id INTEGER NOT NULL,
  data_movimentacao TEXT NOT NULL,
  descricao TEXT NOT NULL,
  timestamp_descoberta TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (processo_id) REFERENCES notificacoes (id) ON DELETE CASCADE
);