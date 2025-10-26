# 🚀 Guia de Deploy - Quantum Surebet Manager v5.0.0

## 📋 Pré-requisitos

1. **Conta no Render.com**
2. **Conta no Supabase**
3. **Repositório no GitHub**
4. **Node.js 20+** (recomendado)

## 🔧 Configuração do Supabase

### 1. Criar Projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote a URL e a chave anônima

### 2. Executar Scripts SQL
```sql
-- Execute no SQL Editor do Supabase
-- 1. Primeiro: supabase-setup.sql
-- 2. Depois: supabase-update.sql
```

## 🚀 Deploy no Render

### 1. Conectar Repositório
- Acesse [render.com](https://render.com)
- Clique em "New +" → "Web Service"
- Conecte seu repositório GitHub
- Selecione o branch `main`

### 2. Configurações do Serviço
```
Name: quantum-surebet-api
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: (deixar vazio)
Node Version: 20.0.0
```

### 3. Build & Deploy
```
Build Command: npm run render-build
Start Command: npm start
```

### 4. Variáveis de Ambiente
Adicione as seguintes variáveis no painel do Render:

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `PORT` | `5000` | Porta do servidor |
| `JWT_SECRET` | `quantum_surebet_2024` | Chave secreta JWT |
| `SUPABASE_URL` | `https://xxx.supabase.co` | URL do Supabase |
| `SUPABASE_ANON_KEY` | `eyJ...` | Chave anônima do Supabase |

## ✅ Verificação do Deploy

### 1. Health Check
Acesse: `https://seu-app.onrender.com/health`

Resposta esperada:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "5.0.0-optimized"
}
```

### 2. Teste da API
```bash
# Teste de registro
curl -X POST https://seu-app.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Teste de login
curl -X POST https://seu-app.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### 3. Teste de Arquivos Estáticos
```bash
# Teste do favicon
curl -I https://seu-app.onrender.com/favicon.ico

# Teste do manifest
curl https://seu-app.onrender.com/manifest.json
```

## 🔍 Troubleshooting

### Erro: "Cannot find module"
- Verifique se o build foi executado corretamente
- Confirme que existe a pasta `dist/server/`
- Verifique se o arquivo `dist/server/index.js` existe

### Erro: "Database connection failed"
- Verifique as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- Confirme se o projeto Supabase está ativo
- Verifique se as tabelas foram criadas corretamente

### Erro: "JWT Secret not found"
- Adicione a variável `JWT_SECRET` no painel do Render
- Use um valor seguro e único

### Erro: "Content Security Policy"
- O sistema já está configurado com CSP otimizado
- Verifique se os arquivos estáticos estão sendo servidos corretamente

## 📊 Monitoramento

### Logs do Render
- Acesse o painel do Render
- Vá em "Logs" para ver os logs em tempo real
- Monitore erros e performance

### Métricas do Supabase
- Acesse o dashboard do Supabase
- Monitore queries, storage e bandwidth
- Configure alertas se necessário

## 🔄 Atualizações

### Deploy Automático
- O Render faz deploy automático a cada push no branch `main`
- Verifique os logs após cada deploy
- Teste as funcionalidades após cada atualização

### Deploy Manual
```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 2. O Render fará o deploy automaticamente
# 3. Verificar logs no painel do Render
```

## 🚀 Otimizações Aplicadas

### Código
- ✅ Removidos arquivos duplicados
- ✅ Código TypeScript otimizado
- ✅ Middleware de segurança aprimorado
- ✅ Tratamento de erros melhorado
- ✅ Performance otimizada

### Estrutura
- ✅ Arquivos desnecessários removidos
- ✅ Dependências otimizadas
- ✅ Configurações de build melhoradas
- ✅ Headers de segurança aprimorados

### Deploy
- ✅ Build command otimizado
- ✅ Variáveis de ambiente configuradas
- ✅ Arquivos estáticos servidos corretamente
- ✅ CSP configurado adequadamente

## 🎉 Deploy Concluído!

Seu sistema Quantum Surebet Manager v5.0.0 está rodando em produção!

**URL da API**: `https://seu-app.onrender.com`  
**Health Check**: `https://seu-app.onrender.com/health`  
**Documentação**: Consulte o README.md para funcionalidades completas

### 📈 Performance Esperada
- **Response Time**: < 150ms
- **Uptime**: 99.9%
- **Lighthouse Score**: 95+
- **Bundle Size**: < 400KB gzipped