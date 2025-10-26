-- QUANTUM SUREBET MANAGER - UPDATE SCRIPT v2.0
-- Execute apenas as novas tabelas e recursos

-- Tabela de surebets detectadas
CREATE TABLE IF NOT EXISTS surebets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
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

-- Função para triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Índices para as novas tabelas
CREATE INDEX IF NOT EXISTS idx_surebets_user_id ON surebets(user_id);
CREATE INDEX IF NOT EXISTS idx_surebets_status ON surebets(status);
CREATE INDEX IF NOT EXISTS idx_surebets_profit ON surebets(profit_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_surebets_commence_time ON surebets(commence_time);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Triggers para updated_at nas novas tabelas
DROP TRIGGER IF EXISTS update_surebets_updated_at ON surebets;
CREATE TRIGGER update_surebets_updated_at BEFORE UPDATE ON surebets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS nas novas tabelas
ALTER TABLE surebets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para as novas tabelas
DROP POLICY IF EXISTS "Users can manage own surebets" ON surebets;
CREATE POLICY "Users can manage own surebets" ON surebets FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own notification settings" ON notification_settings;
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

-- Comentários das novas tabelas
COMMENT ON TABLE surebets IS 'Armazena surebets detectadas pela API';
COMMENT ON TABLE notification_settings IS 'Configurações de notificação por usuário';
COMMENT ON COLUMN surebets.external_id IS 'ID externo da API para evitar duplicatas';
COMMENT ON COLUMN surebets.odds IS 'Array JSON com odds de cada outcome';
COMMENT ON COLUMN surebets.profit_percentage IS 'Percentual de lucro da surebet';