"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const supabase_1 = __importDefault(require("./supabase"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'quantum_surebet_secret_2024';
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Security headers
app.use((req, res, next) => {
    // Only apply CSP to HTML responses, not API responses
    if (req.path.startsWith('/api/') || req.path === '/health') {
        next();
        return;
    }
    res.setHeader('Content-Security-Policy', "default-src 'self'; " +
        "img-src 'self' data: https: blob:; " +
        "style-src 'self' 'unsafe-inline' https:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
        "font-src 'self' data: https:; " +
        "connect-src 'self' https: wss:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
// Serve static files from client public directory
const clientPublicPath = path_1.default.join(__dirname, '../client/public');
app.use(express_1.default.static(clientPublicPath));
// Serve static files if client build exists
const clientBuildPath = path_1.default.join(__dirname, '../client/build');
try {
    app.use(express_1.default.static(clientBuildPath));
}
catch (err) {
    console.log('Client build not found, serving API only');
}
// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
};
// Auth Routes
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const { data, error } = await supabase_1.default
            .from('users')
            .insert([{ email, password: hashedPassword }])
            .select();
        if (error) {
            return res.status(400).json({ error: 'Email já existe' });
        }
        res.json({ message: 'Usuário criado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro interno' });
    }
});
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data: users, error } = await supabase_1.default
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error || !users || !await bcryptjs_1.default.compare(password, users.password)) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        if (!users.aprovado && !users.is_admin) {
            return res.status(403).json({ error: 'Conta pendente de aprovação pelo administrador' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: users.id, email: users.email, isAdmin: users.is_admin }, JWT_SECRET);
        res.json({ token, user: { id: users.id, email: users.email, isAdmin: users.is_admin } });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro interno' });
    }
});
// Bancas Routes
app.get('/api/bancas', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase_1.default
            .from('bancas')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar bancas' });
    }
});
app.post('/api/bancas', authenticateToken, async (req, res) => {
    const { nome, valor_inicial, meta_valor, meta_percentual } = req.body;
    try {
        const { data, error } = await supabase_1.default
            .from('bancas')
            .insert([{
                user_id: req.user.userId,
                nome,
                valor_inicial,
                saldo_atual: valor_inicial,
                meta_valor,
                meta_percentual
            }])
            .select();
        if (error)
            throw error;
        res.json({ id: data[0].id, message: 'Banca criada com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar banca' });
    }
});
// Apostas Routes
app.get('/api/apostas', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase_1.default
            .from('apostas')
            .select(`
        *,
        bancas!inner(nome, user_id)
      `)
            .eq('bancas.user_id', req.user.userId)
            .order('data_aposta', { ascending: false });
        if (error)
            throw error;
        const apostasFormatted = data.map((aposta) => ({
            ...aposta,
            banca_nome: aposta.bancas.nome
        }));
        res.json(apostasFormatted);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar apostas' });
    }
});
app.post('/api/apostas', authenticateToken, async (req, res) => {
    const { banca_id, data_aposta, valor_apostado, casa_aposta, tipo_aposta, odd, resultado, valor_recebido } = req.body;
    try {
        // Verificar se a banca pertence ao usuário
        const { data: banca, error: bancaError } = await supabase_1.default
            .from('bancas')
            .select('*')
            .eq('id', banca_id)
            .eq('user_id', req.user.userId)
            .single();
        if (bancaError || !banca) {
            return res.status(404).json({ error: 'Banca não encontrada' });
        }
        const valorRec = valor_recebido || 0;
        const lucro = valorRec - valor_apostado;
        // Inserir aposta
        const { data: apostaData, error: apostaError } = await supabase_1.default
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
        if (apostaError)
            throw apostaError;
        // Atualizar saldo da banca
        const novoSaldo = banca.saldo_atual + lucro;
        const { error: updateError } = await supabase_1.default
            .from('bancas')
            .update({ saldo_atual: novoSaldo })
            .eq('id', banca_id);
        if (updateError)
            throw updateError;
        res.json({
            id: apostaData[0].id,
            lucro,
            novoSaldo,
            message: 'Aposta registrada'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao registrar aposta' });
    }
});
// Dashboard Route
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const { data: bancas, error } = await supabase_1.default
            .from('bancas')
            .select('*')
            .eq('user_id', req.user.userId);
        if (error)
            throw error;
        const totalBancas = bancas.length;
        const saldoTotal = bancas.reduce((sum, b) => sum + b.saldo_atual, 0);
        const valorInicial = bancas.reduce((sum, b) => sum + b.valor_inicial, 0);
        const lucroTotal = saldoTotal - valorInicial;
        res.json({
            bancas,
            resumo: {
                totalBancas,
                saldoTotal,
                lucroTotal,
                roi: valorInicial > 0 ? ((lucroTotal / valorInicial) * 100) : 0
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dashboard' });
    }
});
// Rotas avançadas
app.get('/api/dashboard/charts', authenticateToken, async (req, res) => {
    try {
        const { data: evolution } = await supabase_1.default
            .from('apostas')
            .select(`
        data_aposta,
        lucro,
        valor_apostado,
        bancas!inner(user_id)
      `)
            .eq('bancas.user_id', req.user.userId)
            .order('data_aposta');
        const chartData = evolution?.reduce((acc, aposta) => {
            const month = aposta.data_aposta.substring(0, 7);
            const existing = acc.find(item => item.date === month);
            if (existing) {
                existing.lucro += aposta.lucro;
                existing.volume += aposta.valor_apostado;
            }
            else {
                acc.push({
                    date: month,
                    lucro: aposta.lucro,
                    volume: aposta.valor_apostado
                });
            }
            return acc;
        }, []) || [];
        res.json({ evolution: chartData, distribution: [] });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados dos gráficos' });
    }
});
app.post('/api/calculos', authenticateToken, async (req, res) => {
    const { tipo, odds, stake, resultado } = req.body;
    try {
        const { data, error } = await supabase_1.default
            .from('calculos')
            .insert([{
                user_id: req.user.userId,
                tipo,
                odds,
                stake,
                resultado
            }])
            .select();
        if (error)
            throw error;
        res.json(data[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao salvar cálculo' });
    }
});
app.get('/api/calculos', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase_1.default
            .from('calculos')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error)
            throw error;
        res.json(data || []);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cálculos' });
    }
});
app.get('/api/alertas', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase_1.default
            .from('alertas')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false })
            .limit(10);
        if (error)
            throw error;
        res.json(data || []);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar alertas' });
    }
});
// Admin middleware
const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Acesso negado - Admin requerido' });
    }
    next();
};
// Admin Routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: users } = await supabase_1.default.from('users').select('id');
        const { data: bancas } = await supabase_1.default.from('bancas').select('id, valor_inicial, saldo_atual');
        const { data: apostas } = await supabase_1.default.from('apostas').select('id, valor_apostado, lucro');
        const stats = {
            totalUsers: users?.length || 0,
            totalBancas: bancas?.length || 0,
            totalApostas: apostas?.length || 0,
            volumeTotal: apostas?.reduce((sum, a) => sum + a.valor_apostado, 0) || 0,
            lucroTotal: apostas?.reduce((sum, a) => sum + a.lucro, 0) || 0
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase_1.default
            .from('users')
            .select('id, email, nome, plano, aprovado, is_admin, created_at')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});
app.get('/api/admin/bancas', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase_1.default
            .from('bancas')
            .select(`
        id, nome, valor_inicial, saldo_atual,
        users!inner(email)
      `)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        const bancasFormatted = data?.map((banca) => ({
            ...banca,
            user_email: banca.users.email
        })) || [];
        res.json(bancasFormatted);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar bancas' });
    }
});
app.get('/api/admin/apostas', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase_1.default
            .from('apostas')
            .select(`
        *,
        bancas!inner(nome, users!inner(email))
      `)
            .order('created_at', { ascending: false })
            .limit(100);
        if (error)
            throw error;
        const apostasFormatted = data?.map((aposta) => ({
            ...aposta,
            banca_nome: aposta.bancas.nome,
            user_email: aposta.bancas.users.email
        })) || [];
        res.json(apostasFormatted);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar apostas' });
    }
});
app.patch('/api/admin/users/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase_1.default
            .from('users')
            .update({
            aprovado: true,
            aprovado_em: new Date().toISOString(),
            aprovado_por: req.user.userId
        })
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ message: 'Usuário aprovado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao aprovar usuário' });
    }
});
app.patch('/api/admin/users/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase_1.default
            .from('users')
            .update({ aprovado: false })
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ message: 'Usuário rejeitado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao rejeitar usuário' });
    }
});
app.patch('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { nome, email, plano } = req.body;
        const { error } = await supabase_1.default
            .from('users')
            .update({ nome, email, plano })
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ message: 'Usuário atualizado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase_1.default
            .from('users')
            .delete()
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ message: 'Usuário excluído com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
});
app.delete('/api/admin/bancas/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase_1.default
            .from('bancas')
            .delete()
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ message: 'Banca excluída com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao excluir banca' });
    }
});
app.delete('/api/admin/apostas/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase_1.default
            .from('apostas')
            .delete()
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ message: 'Aposta excluída com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao excluir aposta' });
    }
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '4.0.0-quantum' });
});
// Serve static assets with proper headers
app.get('/favicon.ico', (req, res) => {
    const faviconPath = path_1.default.join(__dirname, '../client/public/favicon.ico');
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https: blob:;");
    res.sendFile(faviconPath, (err) => {
        if (err) {
            console.log('Favicon not found:', err.message);
            res.status(404).end();
        }
    });
});
app.get('/manifest.json', (req, res) => {
    const manifestPath = path_1.default.join(__dirname, '../client/public/manifest.json');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(manifestPath, (err) => {
        if (err) {
            res.status(404).end();
        }
    });
});
app.get('/robots.txt', (req, res) => {
    const robotsPath = path_1.default.join(__dirname, '../client/public/robots.txt');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(robotsPath, (err) => {
        if (err) {
            res.status(404).end();
        }
    });
});
// Serve React app if available
app.get('*', (req, res) => {
    const indexPath = path_1.default.join(__dirname, '../client/build/index.html');
    try {
        res.sendFile(indexPath);
    }
    catch (err) {
        res.json({ message: 'Quantum Surebet API is running', version: '4.0.0-quantum' });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor Supabase rodando na porta ${PORT}`);
});
//# sourceMappingURL=index.js.map