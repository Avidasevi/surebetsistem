import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const DashboardContainer = styled.div`
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
  background: linear-gradient(45deg, var(--primary), var(--secondary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div)`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    border-color: var(--primary);
    box-shadow: 0 20px 40px rgba(0, 255, 255, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  color: var(--primary);
  text-shadow: 0 0 20px currentColor;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
`;

const StatChange = styled.div<{ positive: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.positive ? 'var(--success)' : 'var(--danger)'};
  margin-top: 0.5rem;
  font-weight: 600;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  height: 400px;
`;

const ChartTitle = styled.h3`
  color: var(--primary);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const BancasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const BancaCard = styled(motion.div)`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;

const BancaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const BancaName = styled.h3`
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 700;
`;

const BancaStatus = styled.div<{ status: string }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${props => {
    switch(props.status) {
      case 'profit': return 'linear-gradient(45deg, var(--success), #00cc33)';
      case 'loss': return 'linear-gradient(45deg, var(--danger), #cc0033)';
      default: return 'linear-gradient(45deg, var(--warning), #cc6600)';
    }
  }};
  color: var(--bg-primary);
`;

const ProgressSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const ProgressBar = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  height: 12px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.color}, ${props => props.color}aa);
  width: ${props => Math.min(Math.max(props.width, 0), 100)}%;
  transition: width 1s ease;
  border-radius: 15px;
  box-shadow: 0 0 20px ${props => props.color}66;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: progressShine 2s ease-in-out infinite;
  }
`;

const BancaStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const BancaStat = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  border: 1px solid var(--glass-border);
`;

const AlertsSection = styled.div`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
`;

const AlertItem = styled(motion.div)<{ type: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 15px;
  border-left: 4px solid ${props => {
    switch(props.type) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      default: return 'var(--primary)';
    }
  }};
  background: rgba(0, 0, 0, 0.2);
`;

const EnhancedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    loadChartData();
    loadAlerts();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const response = await axios.get('/api/dashboard/charts');
      setChartData(response.data.evolution || []);
      setPieData(response.data.distribution || []);
    } catch (error) {
      // Dados mock para demonstração
      setChartData([
        { date: '2024-01', lucro: 150, volume: 1000 },
        { date: '2024-02', lucro: 280, volume: 1500 },
        { date: '2024-03', lucro: 420, volume: 2000 },
        { date: '2024-04', lucro: 380, volume: 1800 },
        { date: '2024-05', lucro: 650, volume: 2500 },
      ]);
      setPieData([
        { name: 'Surebet', value: 45, color: '#00ffff' },
        { name: 'Value Bet', value: 30, color: '#ff00ff' },
        { name: 'Arbitragem', value: 25, color: '#ffff00' },
      ]);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await axios.get('/api/alertas');
      setAlerts(response.data);
    } catch (error) {
      // Alertas mock
      setAlerts([
        { id: 1, type: 'success', title: 'Meta Atingida!', message: 'Banca Principal atingiu 100% da meta', timestamp: new Date() },
        { id: 2, type: 'warning', title: 'Stop Loss Próximo', message: 'Banca Secundária próxima do stop loss diário', timestamp: new Date() },
        { id: 3, type: 'info', title: 'Nova Oportunidade', message: '3 surebets detectadas automaticamente', timestamp: new Date() },
      ]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateProgress = (banca: any) => {
    if (banca.meta_valor) {
      return ((banca.saldo_atual - banca.valor_inicial) / (banca.meta_valor - banca.valor_inicial)) * 100;
    }
    if (banca.meta_percentual) {
      const currentROI = ((banca.saldo_atual / banca.valor_inicial - 1) * 100);
      return (currentROI / banca.meta_percentual) * 100;
    }
    return 0;
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="loading-quantum"></div>
        </div>
      </DashboardContainer>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardContainer>
        <Title>Erro ao carregar dados</Title>
      </DashboardContainer>
    );
  }

  const COLORS = ['#00ffff', '#ff00ff', '#ffff00', '#00ff41', '#ff0040'];

  return (
    <DashboardContainer>
      <Title className="neon-text">QUANTUM DASHBOARD</Title>
      
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatIcon>💰</StatIcon>
          <StatValue>{dashboardData.resumo.totalBancas}</StatValue>
          <StatLabel>Bancas Ativas</StatLabel>
          <StatChange positive={true}>+2 este mês</StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatIcon>📈</StatIcon>
          <StatValue>{formatCurrency(dashboardData.resumo.saldoTotal)}</StatValue>
          <StatLabel>Patrimônio Total</StatLabel>
          <StatChange positive={dashboardData.resumo.lucroTotal >= 0}>
            {dashboardData.resumo.lucroTotal >= 0 ? '+' : ''}{formatCurrency(dashboardData.resumo.lucroTotal)}
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatIcon>🎯</StatIcon>
          <StatValue>{formatCurrency(dashboardData.resumo.lucroTotal)}</StatValue>
          <StatLabel>Lucro Realizado</StatLabel>
          <StatChange positive={dashboardData.resumo.roi >= 0}>
            ROI: {dashboardData.resumo.roi.toFixed(2)}%
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StatIcon>⚡</StatIcon>
          <StatValue>94.2%</StatValue>
          <StatLabel>Taxa de Acerto</StatLabel>
          <StatChange positive={true}>+2.1% vs mês anterior</StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ChartTitle>📊 Evolução dos Lucros</ChartTitle>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00ffff" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#b0b0b0" />
              <YAxis stroke="#b0b0b0" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid #00ffff',
                  borderRadius: '10px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="lucro" 
                stroke="#00ffff" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorLucro)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ChartTitle>🎯 Distribuição por Tipo</ChartTitle>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid #00ffff',
                  borderRadius: '10px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      {dashboardData.bancas.length > 0 && (
        <div>
          <h2 style={{ 
            color: 'var(--primary)', 
            marginBottom: '2rem', 
            fontSize: '1.5rem',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            🏦 Performance das Bancas
          </h2>
          <BancasGrid>
            {dashboardData.bancas.map((banca: any, index: number) => {
              const progress = calculateProgress(banca);
              const roi = ((banca.saldo_atual / banca.valor_inicial - 1) * 100);
              const lucro = banca.saldo_atual - banca.valor_inicial;
              const status = lucro > 0 ? 'profit' : lucro < 0 ? 'loss' : 'neutral';
              
              return (
                <BancaCard
                  key={banca.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <BancaHeader>
                    <BancaName>{banca.nome}</BancaName>
                    <BancaStatus status={status}>
                      {status === 'profit' ? '📈 LUCRO' : status === 'loss' ? '📉 PREJUÍZO' : '➖ NEUTRO'}
                    </BancaStatus>
                  </BancaHeader>
                  
                  <ProgressSection>
                    <ProgressLabel>
                      <span>Progresso da Meta</span>
                      <span>{progress.toFixed(1)}%</span>
                    </ProgressLabel>
                    <ProgressBar>
                      <ProgressFill 
                        width={progress} 
                        color={progress >= 100 ? '#00ff41' : progress >= 75 ? '#ffff00' : '#00ffff'}
                      />
                    </ProgressBar>
                  </ProgressSection>

                  <BancaStats>
                    <BancaStat>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        SALDO ATUAL
                      </div>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {formatCurrency(banca.saldo_atual)}
                      </div>
                    </BancaStat>
                    <BancaStat>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        ROI
                      </div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: roi >= 0 ? 'var(--success)' : 'var(--danger)',
                        fontSize: '1.1rem'
                      }}>
                        {roi.toFixed(2)}%
                      </div>
                    </BancaStat>
                    <BancaStat>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        VALOR INICIAL
                      </div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                        {formatCurrency(banca.valor_inicial)}
                      </div>
                    </BancaStat>
                    <BancaStat>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        RESULTADO
                      </div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: lucro >= 0 ? 'var(--success)' : 'var(--danger)',
                        fontSize: '1.1rem'
                      }}>
                        {formatCurrency(lucro)}
                      </div>
                    </BancaStat>
                  </BancaStats>
                </BancaCard>
              );
            })}
          </BancasGrid>
        </div>
      )}

      <AlertsSection>
        <h3 style={{ 
          color: 'var(--primary)', 
          marginBottom: '1.5rem',
          fontSize: '1.2rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          🔔 Alertas e Notificações
        </h3>
        {alerts.map((alert, index) => (
          <AlertItem
            key={alert.id}
            type={alert.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div style={{ fontSize: '1.5rem' }}>
              {alert.type === 'success' ? '✅' : 
               alert.type === 'warning' ? '⚠️' : 
               alert.type === 'danger' ? '🚨' : 'ℹ️'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {alert.title}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {alert.message}
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </div>
          </AlertItem>
        ))}
      </AlertsSection>
    </DashboardContainer>
  );
};

export default EnhancedDashboard;