import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import supabase from './supabase';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'quantum_surebet_secret_2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/') || req.path === '/health') {
    next();
    return;
  }
  
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "img-src 'self' data: https: blob:; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
    "font-src 'self' data: https:; " +
    "connect-src 'self' https: wss:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files
const clientPublicPath = path.join(__dirname, '../client/public');
app.use(express.static(clientPublicPath));

const clientBuildPath = path.join(__dirname, '../client/build');
try {
  app.use(express.static(clientBuildPath));
} catch (err) {
  console.log('Client build not found, serving API only');
}

// Auth middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: 'Token inválido' });
      return;
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Acesso negado - Admin requerido' });
    return;
  }
  next();
};

// Auth Routes
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }])
      .select();

    if (error) {
      return res.status(400).json({ error: 'Email já existe' });
    }

    return res.json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !users || !await bcrypt.compare(password, users.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!users.aprovado && !users.is_admin) {
      return res.status(403).json({ error: 'Conta pendente de aprovação' });
    }

    const token = jwt.sign(
      { userId: users.id, email: users.email, isAdmin: users.is_admin }, 
      JWT_SECRET
    );
    
    return res.json({ 
      token, 
      user: { id: users.id, email: users.email, isAdmin: users.is_admin } 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

// Bancas Routes
app.get('/api/bancas', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('bancas')
      .select('*')
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar bancas' });
  }
});

app.post('/api/bancas', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { nome, valor_inicial, meta_valor, meta_percentual } = req.body;

    const { data, error } = await supabase
      .from('bancas')
      .insert([{
        user_id: req.user!.userId,
        nome,
        valor_inicial,
        saldo_atual: valor_inicial,
        meta_valor,
        meta_percentual
      }])
      .select();

    if (error) throw error;
    return res.json({ id: data[0].id, message: 'Banca criada com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar banca' });
  }
});

// Apostas Routes
app.get('/api/apostas', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('apostas')
      .select(`
        *,
        bancas!inner(nome, user_id)
      `)
      .eq('bancas.user_id', req.user!.userId)
      .order('data_aposta', { ascending: false });

    if (error) throw error;
    
    const apostasFormatted = data.map((aposta: any) => ({
      ...aposta,
      banca_nome: aposta.bancas.nome
    }));

    return res.json(apostasFormatted);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar apostas' });
  }
});

app.post('/api/apostas', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { banca_id, data_aposta, valor_apostado, casa_aposta, tipo_aposta, odd, resultado, valor_recebido } = req.body;

    // Verificar se a banca pertence ao usuário
    const { data: banca, error: bancaError } = await supabase
      .from('bancas')
      .select('*')
      .eq('id', banca_id)
      .eq('user_id', req.user!.userId)
      .single();

    if (bancaError || !banca) {
      return res.status(404).json({ error: 'Banca não encontrada' });
    }

    const valorRec = valor_recebido || 0;
    const lucro = valorRec - valor_apostado;

    // Inserir aposta
    const { data: apostaData, error: apostaError } = await supabase
      .from('apostas')
      .insert([{
        banca_id,
        data_aposta,
        valor_apostado,
        casa_aposta,
        tipo_aposta,
        odd,
        resultado,
        valor_recebido: valorRec,
        lucro
      }])
      .select();

    if (apostaError) throw apostaError;

    // Atualizar saldo da banca
    const novoSaldo = banca.saldo_atual + lucro;
    const { error: updateError } = await supabase
      .from('bancas')
      .update({ saldo_atual: novoSaldo })
      .eq('id', banca_id);

    if (updateError) throw updateError;

    return res.json({ 
      id: apostaData[0].id, 
      lucro, 
      novoSaldo, 
      message: 'Aposta registrada' 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao registrar aposta' });
  }
});

// Dashboard Route
app.get('/api/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data: bancas, error } = await supabase
      .from('bancas')
      .select('*')
      .eq('user_id', req.user!.userId);

    if (error) throw error;

    const totalBancas = bancas.length;
    const saldoTotal = bancas.reduce((sum: number, b: any) => sum + b.saldo_atual, 0);
    const valorInicial = bancas.reduce((sum: number, b: any) => sum + b.valor_inicial, 0);
    const lucroTotal = saldoTotal - valorInicial;

    return res.json({
      bancas,
      resumo: {
        totalBancas,
        saldoTotal,
        lucroTotal,
        roi: valorInicial > 0 ? ((lucroTotal / valorInicial) * 100) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
});

// Charts Route
app.get('/api/dashboard/charts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data: evolution } = await supabase
      .from('apostas')
      .select(`
        data_aposta,
        lucro,
        valor_apostado,
        bancas!inner(user_id)
      `)
      .eq('bancas.user_id', req.user!.userId)
      .order('data_aposta');

    const chartData = evolution?.reduce((acc: any[], aposta: any) => {
      const month = aposta.data_aposta.substring(0, 7);
      const existing = acc.find(item => item.date === month);
      
      if (existing) {
        existing.lucro += aposta.lucro;
        existing.volume += aposta.valor_apostado;
      } else {
        acc.push({
          date: month,
          lucro: aposta.lucro,
          volume: aposta.valor_apostado
        });
      }
      return acc;
    }, []) || [];

    return res.json({ evolution: chartData, distribution: [] });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar dados dos gráficos' });
  }
});

// Calculos Routes
app.post('/api/calculos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { tipo, odds, stake, resultado } = req.body;
    const { data, error } = await supabase
      .from('calculos')
      .insert([{
        user_id: req.user!.userId,
        tipo,
        odds,
        stake,
        resultado
      }])
      .select();

    if (error) throw error;
    return res.json(data[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao salvar cálculo' });
  }
});

app.get('/api/calculos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('calculos')
      .select('*')
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar cálculos' });
  }
});

// Alertas Route
app.get('/api/alertas', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('alertas')
      .select('*')
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar alertas' });
  }
});

// Admin Routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [users, bancas, apostas] = await Promise.all([
      supabase.from('users').select('id'),
      supabase.from('bancas').select('id, valor_inicial, saldo_atual'),
      supabase.from('apostas').select('id, valor_apostado, lucro')
    ]);

    const stats = {
      totalUsers: users.data?.length || 0,
      totalBancas: bancas.data?.length || 0,
      totalApostas: apostas.data?.length || 0,
      volumeTotal: apostas.data?.reduce((sum: number, a: any) => sum + a.valor_apostado, 0) || 0,
      lucroTotal: apostas.data?.reduce((sum: number, a: any) => sum + a.lucro, 0) || 0
    };

    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, nome, plano, aprovado, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.patch('/api/admin/users/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        aprovado: true, 
        aprovado_em: new Date().toISOString(),
        aprovado_por: req.user!.userId 
      })
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ message: 'Usuário aprovado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao aprovar usuário' });
  }
});

app.patch('/api/admin/users/:id/reject', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ aprovado: false })
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ message: 'Usuário rejeitado' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao rejeitar usuário' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  return res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    version: '5.0.0-optimized' 
  });
});

// Static assets
app.get('/favicon.ico', (_req: Request, res: Response) => {
  const faviconPath = path.join(__dirname, '../client/public/favicon.ico');
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  return res.sendFile(faviconPath, (err) => {
    if (err) res.status(404).end();
  });
});

app.get('/manifest.json', (_req: Request, res: Response) => {
  const manifestPath = path.join(__dirname, '../client/public/manifest.json');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  return res.sendFile(manifestPath, (err) => {
    if (err) res.status(404).end();
  });
});

// Serve React app
app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(__dirname, '../client/build/index.html');
  try {
    return res.sendFile(indexPath);
  } catch (err) {
    return res.json({ 
      message: 'Quantum Surebet API is running', 
      version: '5.0.0-optimized',
      endpoints: ['/api/register', '/api/login', '/api/dashboard', '/api/bancas', '/api/apostas', '/health']
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Quantum Surebet API v5.0.0 rodando na porta ${PORT}`);
});