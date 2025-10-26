import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AdminContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 3.5rem;
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  background: linear-gradient(45deg, var(--danger), var(--warning), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 50px rgba(255, 0, 64, 0.8);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div)<{ variant?: string }>`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 2px solid ${props => {
    switch(props.variant) {
      case 'pending': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      case 'success': return 'var(--success)';
      default: return 'var(--primary)';
    }
  }};
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 0 30px ${props => {
    switch(props.variant) {
      case 'pending': return 'rgba(255, 128, 0, 0.3)';
      case 'danger': return 'rgba(255, 0, 64, 0.3)';
      case 'success': return 'rgba(0, 255, 65, 0.3)';
      default: return 'rgba(0, 255, 255, 0.3)';
    }
  }};
`;

const TabsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled(motion.button)<{ active?: boolean }>`
  background: ${props => props.active ? 
    'linear-gradient(45deg, var(--danger), var(--warning))' : 
    'var(--glass)'};
  border: 2px solid ${props => props.active ? 'var(--danger)' : 'var(--glass-border)'};
  color: ${props => props.active ? 'var(--bg-primary)' : 'var(--text-primary)'};
  padding: 15px 20px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
`;

const ContentCard = styled(motion.div)`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  background: rgba(255, 0, 64, 0.1);
  color: var(--danger);
  padding: 12px 8px;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  border-bottom: 2px solid var(--danger);
`;

const Td = styled.td`
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  vertical-align: middle;
`;

const ActionButton = styled(motion.button)<{ variant?: string; size?: string }>`
  background: ${props => {
    switch(props.variant) {
      case 'approve': return 'linear-gradient(45deg, var(--success), #00cc33)';
      case 'reject': return 'linear-gradient(45deg, var(--danger), #cc0033)';
      case 'edit': return 'linear-gradient(45deg, var(--primary), var(--secondary))';
      case 'delete': return 'linear-gradient(45deg, var(--danger), #990033)';
      default: return 'linear-gradient(45deg, var(--primary), var(--secondary))';
    }
  }};
  border: none;
  border-radius: ${props => props.size === 'small' ? '10px' : '15px'};
  padding: ${props => props.size === 'small' ? '6px 12px' : '10px 16px'};
  color: var(--bg-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: ${props => props.size === 'small' ? '0.7rem' : '0.8rem'};
  text-transform: uppercase;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: var(--glass);
  backdrop-filter: blur(30px);
  border: 2px solid var(--primary);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
`;

const Input = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 1rem;

  option {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  
  ${props => {
    switch(props.status) {
      case 'aprovado':
        return 'background: rgba(0, 255, 65, 0.2); color: var(--success); border: 1px solid var(--success);';
      case 'pendente':
        return 'background: rgba(255, 128, 0, 0.2); color: var(--warning); border: 1px solid var(--warning);';
      case 'rejeitado':
        return 'background: rgba(255, 0, 64, 0.2); color: var(--danger); border: 1px solid var(--danger);';
      default:
        return 'background: rgba(255, 255, 255, 0.1); color: var(--text-secondary);';
    }
  }}
`;

const SuperAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [bancas, setBancas] = useState<any[]>([]);
  const [apostas, setApostas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '', plano: 'free' });

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
      console.error('Erro ao carregar dados admin:', error);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/approve`);
      loadAdminData();
      alert('Usuário aprovado com sucesso!');
    } catch (error) {
      alert('Erro ao aprovar usuário');
    }
  };

  const rejectUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja rejeitar este usuário?')) {
      try {
        await axios.patch(`/api/admin/users/${userId}/reject`);
        loadAdminData();
        alert('Usuário rejeitado!');
      } catch (error) {
        alert('Erro ao rejeitar usuário');
      }
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('ATENÇÃO: Isso excluirá permanentemente o usuário e todos os seus dados. Continuar?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        loadAdminData();
        alert('Usuário excluído permanentemente!');
      } catch (error) {
        alert('Erro ao excluir usuário');
      }
    }
  };

  const editUser = (user: any) => {
    setEditingUser(user);
    setEditForm({ nome: user.nome || '', email: user.email, plano: user.plano });
    setShowModal(true);
  };

  const saveUserEdit = async () => {
    try {
      await axios.patch(`/api/admin/users/${editingUser.id}`, editForm);
      setShowModal(false);
      setEditingUser(null);
      loadAdminData();
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar usuário');
    }
  };

  const deleteBanca = async (bancaId: string) => {
    if (window.confirm('Excluir esta banca e todas as apostas relacionadas?')) {
      try {
        await axios.delete(`/api/admin/bancas/${bancaId}`);
        loadAdminData();
        alert('Banca excluída!');
      } catch (error) {
        alert('Erro ao excluir banca');
      }
    }
  };

  const deleteAposta = async (apostaId: string) => {
    if (window.confirm('Excluir esta aposta?')) {
      try {
        await axios.delete(`/api/admin/apostas/${apostaId}`);
        loadAdminData();
        alert('Aposta excluída!');
      } catch (error) {
        alert('Erro ao excluir aposta');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const pendingUsers = users.filter(u => !u.aprovado && !u.is_admin);
  const approvedUsers = users.filter(u => u.aprovado || u.is_admin);

  const renderContent = () => {
    switch(activeTab) {
      case 'pending':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--warning)' }}>
              ⏳ Usuários Pendentes de Aprovação ({pendingUsers.length})
            </h3>
            {pendingUsers.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                Nenhum usuário pendente de aprovação
              </p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Email</Th>
                    <Th>Nome</Th>
                    <Th>Cadastro</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map(user => (
                    <tr key={user.id}>
                      <Td>{user.email}</Td>
                      <Td>{user.nome || 'N/A'}</Td>
                      <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                      <Td>
                        <ActionButton
                          variant="approve"
                          size="small"
                          onClick={() => approveUser(user.id)}
                          whileHover={{ scale: 1.05 }}
                        >
                          ✅ Aprovar
                        </ActionButton>
                        <ActionButton
                          variant="reject"
                          size="small"
                          onClick={() => rejectUser(user.id)}
                          whileHover={{ scale: 1.05 }}
                        >
                          ❌ Rejeitar
                        </ActionButton>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </ContentCard>
        );

      case 'users':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
              👥 Todos os Usuários ({users.length})
            </h3>
            <Table>
              <thead>
                <tr>
                  <Th>Email</Th>
                  <Th>Nome</Th>
                  <Th>Plano</Th>
                  <Th>Status</Th>
                  <Th>Admin</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <Td>{user.email}</Td>
                    <Td>{user.nome || 'N/A'}</Td>
                    <Td>
                      <StatusBadge status={user.plano}>
                        {user.plano}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <StatusBadge status={user.aprovado ? 'aprovado' : 'pendente'}>
                        {user.aprovado ? 'Aprovado' : 'Pendente'}
                      </StatusBadge>
                    </Td>
                    <Td>{user.is_admin ? '🔴 Admin' : '👤 User'}</Td>
                    <Td>
                      <ActionButton
                        variant="edit"
                        size="small"
                        onClick={() => editUser(user)}
                        whileHover={{ scale: 1.05 }}
                      >
                        ✏️ Editar
                      </ActionButton>
                      {!user.is_admin && (
                        <ActionButton
                          variant="delete"
                          size="small"
                          onClick={() => deleteUser(user.id)}
                          whileHover={{ scale: 1.05 }}
                        >
                          🗑️ Excluir
                        </ActionButton>
                      )}
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
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--success)' }}>
              💰 Todas as Bancas ({bancas.length})
            </h3>
            <Table>
              <thead>
                <tr>
                  <Th>Nome</Th>
                  <Th>Usuário</Th>
                  <Th>Inicial</Th>
                  <Th>Atual</Th>
                  <Th>ROI</Th>
                  <Th>Ações</Th>
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
                      <Td>
                        <ActionButton
                          variant="delete"
                          size="small"
                          onClick={() => deleteBanca(banca.id)}
                          whileHover={{ scale: 1.05 }}
                        >
                          🗑️ Excluir
                        </ActionButton>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </ContentCard>
        );

      case 'apostas':
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>
              🎯 Todas as Apostas ({apostas.length})
            </h3>
            <Table>
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Usuário</Th>
                  <Th>Banca</Th>
                  <Th>Casa</Th>
                  <Th>Valor</Th>
                  <Th>Resultado</Th>
                  <Th>Lucro</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {apostas.slice(0, 50).map(aposta => (
                  <tr key={aposta.id}>
                    <Td>{new Date(aposta.data_aposta).toLocaleDateString()}</Td>
                    <Td>{aposta.user_email}</Td>
                    <Td>{aposta.banca_nome}</Td>
                    <Td>{aposta.casa_aposta}</Td>
                    <Td>{formatCurrency(aposta.valor_apostado)}</Td>
                    <Td>
                      <StatusBadge status={aposta.resultado}>
                        {aposta.resultado}
                      </StatusBadge>
                    </Td>
                    <Td style={{ 
                      color: aposta.lucro >= 0 ? 'var(--success)' : 'var(--danger)',
                      fontWeight: 'bold'
                    }}>
                      {formatCurrency(aposta.lucro)}
                    </Td>
                    <Td>
                      <ActionButton
                        variant="delete"
                        size="small"
                        onClick={() => deleteAposta(aposta.id)}
                        whileHover={{ scale: 1.05 }}
                      >
                        🗑️ Excluir
                      </ActionButton>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ContentCard>
        );

      default:
        return null;
    }
  };

  return (
    <AdminContainer>
      <Title className="neon-text">🔴 SUPER ADMIN CONTROL</Title>
      
      <StatsGrid>
        <StatCard variant="pending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{pendingUsers.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PENDENTES</div>
        </StatCard>

        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{users.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>USUÁRIOS</div>
        </StatCard>

        <StatCard variant="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{bancas.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>BANCAS</div>
        </StatCard>

        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{apostas.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>APOSTAS</div>
        </StatCard>

        <StatCard variant="danger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💎</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{formatCurrency(stats.volumeTotal || 0)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>VOLUME</div>
        </StatCard>
      </StatsGrid>

      <TabsGrid>
        {[
          { key: 'pending', label: '⏳ Pendentes', count: pendingUsers.length },
          { key: 'users', label: '👥 Usuários', count: users.length },
          { key: 'bancas', label: '💰 Bancas', count: bancas.length },
          { key: 'apostas', label: '🎯 Apostas', count: apostas.length }
        ].map(tab => (
          <Tab
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label} ({tab.count})
          </Tab>
        ))}
      </TabsGrid>

      {renderContent()}

      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
                ✏️ Editar Usuário
              </h3>
              
              <Input
                type="text"
                placeholder="Nome"
                value={editForm.nome}
                onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
              />
              
              <Input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
              
              <Select
                value={editForm.plano}
                onChange={(e) => setEditForm({...editForm, plano: e.target.value})}
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </Select>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <ActionButton
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  Cancelar
                </ActionButton>
                <ActionButton
                  variant="approve"
                  onClick={saveUserEdit}
                  style={{ flex: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  Salvar
                </ActionButton>
              </div>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </AdminContainer>
  );
};

export default SuperAdminPanel;