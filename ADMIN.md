# 🔴 PAINEL ADMINISTRATIVO

## 👤 Usuário Admin Padrão

### Credenciais de Acesso:
- **Email**: `admin@quantum.com`
- **Senha**: `password`

## 🚀 Como Acessar

1. **Faça login** com as credenciais admin
2. **Botão Admin** aparecerá no menu (🔴 Admin)
3. **Clique** para acessar o painel

## ⚡ Funcionalidades Admin

### 📊 Dashboard Admin
- **Estatísticas Gerais**: Usuários, Bancas, Apostas
- **Volume Total**: Movimentação financeira
- **Métricas**: Performance do sistema

### 👥 Gerenciar Usuários
- **Listar** todos os usuários
- **Ver planos**: Free, Pro, Premium
- **Ações**: Ativar/Desativar, Excluir
- **Dados**: Email, Nome, Data cadastro

### 💰 Bancas do Sistema
- **Visão geral** de todas as bancas
- **Performance**: ROI, Lucros/Prejuízos
- **Usuários**: Proprietário de cada banca
- **Valores**: Inicial vs Atual

### ⚙️ Sistema
- **Status**: Online/Offline
- **Banco**: Conexão Supabase
- **Versão**: Sistema atual
- **Saúde**: Monitoramento

## 🔒 Segurança

### Middleware Admin
- **Verificação JWT**: Token válido
- **Campo isAdmin**: true no banco
- **Middleware**: requireAdmin()
- **Rotas protegidas**: /api/admin/*

### Permissões
- ✅ **Ver estatísticas** gerais
- ✅ **Gerenciar usuários**
- ✅ **Visualizar bancas**
- ✅ **Excluir dados**
- ❌ **Não pode** acessar dados pessoais

## 🎨 Interface Admin

### Design Diferenciado
- **Cor vermelha**: Tema admin
- **Ícones especiais**: 🔴 Admin
- **Alertas**: Ações críticas
- **Confirmações**: Exclusões

### Responsividade
- **Desktop**: Layout completo
- **Mobile**: Adaptado
- **Tablets**: Otimizado

---

## ⚠️ IMPORTANTE

**Este usuário tem acesso total ao sistema!**
- Altere a senha padrão
- Use apenas para administração
- Monitore logs de acesso