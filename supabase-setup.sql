-- QUANTUM SUREBET MANAGER - ADVANCED DATABASE SCHEMA v2.0
-- Execute este SQL no SQL Editor do Supabase
-- Inclui tabelas para sistema de Surebets com The Odds API

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários com perfil avançado
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nome TEXT,
  avatar_url TEXT,
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free', 'pro', 'premium')),
  is_admin BOOLEAN DEFAULT false,
  aprovado BOOLEAN DEFAULT false,
  aprovado_em TIMESTAMP WITH TIME ZONE,
  aprovado_por UUID REFERENCES users(id),
  configuracoes JSONB DEFAULT '{}',
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir usuário admin padrão
INSERT INTO users (email, password, nome, is_admin, plano, aprovado, aprovado_em) VALUES 
('admin@quantum.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', true, 'premium', true, NOW());
-- Senha: password

-- Tabela de bancas com recursos avançados
CREATE TABLE bancas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor_inicial DECIMAL(15,2) NOT NULL,
  saldo_atual DECIMAL(15,2) NOT NULL,
  meta_valor DECIMAL(15,2),
  meta_percentual DECIMAL(8,2),
  stop_loss_diario DECIMAL(15,2) DEFAULT 0,
  stop_loss_semanal DECIMAL(15,2) DEFAULT 0,
  stop_loss_mensal DECIMAL(15,2) DEFAULT 0,
  risco TEXT DEFAULT 'medio' CHECK (risco IN ('baixo', 'medio', 'alto')),
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'finalizada')),
  cor TEXT DEFAULT '#00ffff',
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de apostas com análise avançada
CREATE TABLE apostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banca_id UUID REFERENCES bancas(id) ON DELETE CASCADE,
  data_aposta TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_apostado DECIMAL(15,2) NOT NULL,
  casa_aposta TEXT NOT NULL,
  tipo_aposta TEXT NOT NULL,
  categoria TEXT DEFAULT 'surebet',
  esporte TEXT,
  liga TEXT,
  evento TEXT,
  mercado TEXT,
  odd DECIMAL(10,3) NOT NULL,
  resultado TEXT NOT NULL CHECK (resultado IN ('ganhou', 'perdeu', 'reembolsada', 'cancelada')),
  valor_recebido DECIMAL(15,2) DEFAULT 0,
  lucro DECIMAL(15,2) DEFAULT 0,
  roi DECIMAL(8,4) DEFAULT 0,
  margem DECIMAL(8,4),
  confianca INTEGER DEFAULT 5 CHECK (confianca BETWEEN 1 AND 10),
  notas TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estratégias
CREATE TABLE estrategias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL,
  parametros JSONB NOT NULL,
  ativa BOOLEAN DEFAULT true,
  performance JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de alertas e notificações
CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  dados JSONB,
  lido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de cálculo
CREATE TABLE calculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  odds DECIMAL(10,3)[],
  stake DECIMAL(15,2),
  resultado JSONB NOT NULL,
  favorito BOOLEAN DEFAULT false,
  nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de auditoria
CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de surebets detectadas
CREATE TABLE surebets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  sport TEXT NOT NULL,
  league TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  commence_time TIMESTAMP WITH TIME ZONE NOT NULL,
  profit_percentage DECIMAL(8,3) NOT NULL,
  total_implied_probability DECIMAL(8,4) NOT NULL,
  odds JSONB NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'taken')),
  notified BOOLEAN DEFAULT false,
  favorited BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de notificação
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT true,
  min_profit DECIMAL(8,3) DEFAULT 1.0,
  high_profit_threshold DECIMAL(8,3) DEFAULT 5.0,
  sound_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  sports_filter TEXT[],
  bookmakers_filter TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_bancas_user_id ON bancas(user_id);
CREATE INDEX idx_apostas_banca_id ON apostas(banca_id);
CREATE INDEX idx_apostas_data ON apostas(data_aposta);
CREATE INDEX idx_apostas_resultado ON apostas(resultado);
CREATE INDEX idx_alertas_user_id ON alertas(user_id, lido);
CREATE INDEX idx_calculos_user_id ON calculos(user_id);
CREATE INDEX idx_logs_user_id ON logs_auditoria(user_id);
CREATE INDEX idx_surebets_user_id ON surebets(user_id);
CREATE INDEX idx_surebets_status ON surebets(status);
CREATE INDEX idx_surebets_profit ON surebets(profit_percentage DESC);
CREATE INDEX idx_surebets_commence_time ON surebets(commence_time);
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

-- Views para relatórios
CREATE VIEW vw_performance_bancas AS
SELECT 
  b.id,
  b.nome,
  b.valor_inicial,
  b.saldo_atual,
  b.saldo_atual - b.valor_inicial as lucro_total,
  CASE 
    WHEN b.valor_inicial > 0 THEN ((b.saldo_atual - b.valor_inicial) / b.valor_inicial * 100)
    ELSE 0 
  END as roi_percentual,
  COUNT(a.id) as total_apostas,
  COUNT(CASE WHEN a.resultado = 'ganhou' THEN 1 END) as apostas_ganhas,
  CASE 
    WHEN COUNT(a.id) > 0 THEN (COUNT(CASE WHEN a.resultado = 'ganhou' THEN 1 END)::DECIMAL / COUNT(a.id) * 100)
    ELSE 0 
  END as taxa_acerto,
  AVG(a.lucro) as lucro_medio,
  SUM(a.valor_apostado) as volume_apostado
FROM bancas b
LEFT JOIN apostas a ON b.id = a.banca_id
GROUP BY b.id, b.nome, b.valor_inicial, b.saldo_atual;

-- Funções para triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bancas_updated_at BEFORE UPDATE ON bancas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_apostas_updated_at BEFORE UPDATE ON apostas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surebets_updated_at BEFORE UPDATE ON surebets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular ROI automaticamente
CREATE OR REPLACE FUNCTION calculate_roi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valor_apostado > 0 THEN
        NEW.roi = (NEW.lucro / NEW.valor_apostado) * 100;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_apostas_roi BEFORE INSERT OR UPDATE ON apostas FOR EACH ROW EXECUTE FUNCTION calculate_roi();

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE apostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estrategias ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE surebets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage own data" ON users FOR ALL USING (id = auth.uid());
CREATE POLICY "Users can manage own bancas" ON bancas FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own apostas" ON apostas FOR ALL USING (
  EXISTS (SELECT 1 FROM bancas WHERE bancas.id = apostas.banca_id AND bancas.user_id = auth.uid())
);
CREATE POLICY "Users can manage own estrategias" ON estrategias FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own alertas" ON alertas FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own calculos" ON calculos FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own logs" ON logs_auditoria FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own surebets" ON surebets FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own notification settings" ON notification_settings FOR ALL USING (user_id = auth.uid());

-- Função para limpar surebets expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_surebets()
RETURNS void AS $$
BEGIN
    UPDATE surebets 
    SET status = 'expired' 
    WHERE status = 'active' 
    AND commence_time < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comentários das tabelas
COMMENT ON TABLE surebets IS 'Armazena surebets detectadas pela API';
COMMENT ON TABLE notification_settings IS 'Configurações de notificação por usuário';
COMMENT ON COLUMN surebets.external_id IS 'ID externo da API para evitar duplicatas';
COMMENT ON COLUMN surebets.odds IS 'Array JSON com odds de cada outcome';
COMMENT ON COLUMN surebets.profit_percentage IS 'Percentual de lucro da surebet';