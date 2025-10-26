import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder_key';

// Log de aviso se as variáveis não estiverem definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  AVISO: SUPABASE_URL e SUPABASE_ANON_KEY não estão definidas!');
  console.warn('⚠️  Configure as variáveis de ambiente no Render.com');
  console.warn('⚠️  O sistema funcionará em modo de demonstração');
}

export default createClient(supabaseUrl, supabaseKey);