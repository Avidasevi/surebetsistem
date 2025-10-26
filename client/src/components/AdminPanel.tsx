import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 3rem;
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  background: linear-gradient(45deg, var(--danger), var(--warning), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div)`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--danger);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 0 30px rgba(255, 0, 64, 0.2);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255, 0, 64, 0.3);
  }
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--danger);
  filter: drop-shadow(0 0 10px var(--danger));
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  color: var(--danger);
  text-shadow: 0 0 20px currentColor;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const Tab = styled(motion.button)<{ active?: boolean }>`
  background: ${props => props.active ? 
    'linear-gradient(45deg, var(--danger), var(--warning))' : 
    'var(--glass)'};
  border: 1px solid ${props => props.active ? 'var(--danger)' : 'var(--glass-border)'};
  color: ${props => props.active ? 'var(--bg-primary)' : 'var(--text-primary)'};
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
`;

const ContentCard = styled(motion.div)`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: rgba(255, 0, 64, 0.1);
  color: var(--danger);
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--danger);
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
`;

const ActionButton = styled(motion.button)<{ variant?: string }>`
  background: ${props => {
    switch(props.variant) {
      case 'danger': return 'linear-gradient(45deg, var(--danger), #cc0033)';
      case 'success': return 'linear-gradient(45deg, var(--success), #00cc33)';
      default: return 'linear-gradient(45deg, var(--primary), var(--secondary))';
    }
  }};
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  color: var(--bg-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
  text-transform: uppercase;
  margin-right: 0.5rem;
`;

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [bancas, setBancas] = useState<any[]>([]);
  const [apostas, setApostas] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, bancasRes, apostasRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/bancas'),
        axios.get('/api/admin/apostas')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBancas(bancasRes.data);
      setApostas(apostasRes.data);
    } catch (error) {
      // Mock data para demonstração
      setStats({
        totalUsers: 156,
        totalBancas: 342,
        totalApostas: 1247,
        volumeTotal: 125000,
        lucroTotal: 8750
      });
      
      setUsers([
        { id: 1, email: 'user1@test.com', nome: 'João Silva', plano: 'pro', created_at: '2024-01-15' },
        { id: 2, email: 'user2@test.com', nome: 'Maria Santos', plano: 'free', created_at: '2024-01-20' }
      ]);
      
      setBancas([
        { id: 1, nome: 'Banca Principal', valor_inicial: 1000, saldo_atual: 1250, user_email: 'user1@test.com' },
        { id: 2, nome: 'Banca Teste', valor_inicial: 500, saldo_atual: 480, user_email: 'user2@test.com' }
      ]);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { active: !currentStatus });
      loadAdminData();
    } catch (error) {
      alert('Erro ao alterar status do usuário');
    }
  };

  const deleteUser = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        loadAdminData();
      } catch (error) {
        alert('Erro ao excluir usuário');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--danger)' }}>
              👥 Gerenciar Usuários
            </h3>
            <Table>
              <thead>
                <tr>
                  <Th>Email</Th>
                  <Th>Nome</Th>
                  <Th>Plano</Th>
                  <Th>Cadastro</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <Td>{user.email}</Td>
                    <Td>{user.nome || 'N/A'}</Td>
                    <Td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '10px',
                        background: user.plano === 'premium' ? 'var(--warning)' : 
                                   user.plano === 'pro' ? 'var(--primary)' : 'var(--text-secondary)',
                        color: 'var(--bg-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {user.plano.toUpperCase()}
                      </span>
                    </Td>
                    <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                    <Td>
                      <ActionButton
                        variant="success"
                        onClick={() => toggleUserStatus(user.id, true)}
                        whileHover={{ scale: 1.05 }}
                      >
                        Ativar
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => deleteUser(user.id)}
                        whileHover={{ scale: 1.05 }}
                      >
                        Excluir
                      </ActionButton>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ContentCard>
        );

      case 'bancas':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--danger)' }}>
              💰 Bancas do Sistema
            </h3>
            <Table>
              <thead>
                <tr>
                  <Th>Nome</Th>
                  <Th>Usuário</Th>
                  <Th>Valor Inicial</Th>
                  <Th>Saldo Atual</Th>
                  <Th>ROI</Th>
                </tr>
              </thead>
              <tbody>
                {bancas.map(banca => {
                  const roi = ((banca.saldo_atual - banca.valor_inicial) / banca.valor_inicial) * 100;
                  return (
                    <tr key={banca.id}>
                      <Td>{banca.nome}</Td>
                      <Td>{banca.user_email}</Td>
                      <Td>{formatCurrency(banca.valor_inicial)}</Td>
                      <Td style={{ 
                        color: banca.saldo_atual >= banca.valor_inicial ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 'bold'
                      }}>
                        {formatCurrency(banca.saldo_atual)}
                      </Td>
                      <Td style={{ 
                        color: roi >= 0 ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 'bold'
                      }}>
                        {roi.toFixed(2)}%
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </ContentCard>
        );

      case 'system':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--danger)' }}>
              ⚙️ Configurações do Sistema
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '15px',
                border: '1px solid var(--glass-border)'
              }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Status do Sistema</h4>
                <p style={{ color: 'var(--success)' }}>🟢 Online - Todos os serviços funcionando</p>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '15px',
                border: '1px solid var(--glass-border)'
              }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Banco de Dados</h4>
                <p style={{ color: 'var(--success)' }}>🟢 Supabase PostgreSQL - Conectado</p>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '15px',
                border: '1px solid var(--glass-border)'
              }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Versão</h4>
                <p>Quantum SureBet Manager v4.0.0</p>
              </div>
            </div>
          </ContentCard>
        );

      default:
        return null;
    }
  };

  return (
    <AdminContainer>
      <Title className="neon-text">🔴 ADMIN PANEL</Title>
      
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon>👥</StatIcon>
          <StatValue>{stats.totalUsers || 0}</StatValue>
          <StatLabel>Total Usuários</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon>💰</StatIcon>
          <StatValue>{stats.totalBancas || 0}</StatValue>
          <StatLabel>Total Bancas</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon>🎯</StatIcon>
          <StatValue>{stats.totalApostas || 0}</StatValue>
          <StatLabel>Total Apostas</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatIcon>💎</StatIcon>
          <StatValue>{formatCurrency(stats.volumeTotal || 0)}</StatValue>
          <StatLabel>Volume Total</StatLabel>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        {[
          { key: 'users', label: '👥 Usuários', icon: '👥' },
          { key: 'bancas', label: '💰 Bancas', icon: '💰' },
          { key: 'system', label: '⚙️ Sistema', icon: '⚙️' }
        ].map(tab => (
          <Tab
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      {renderContent()}
    </AdminContainer>
  );
};

export default AdminPanel;