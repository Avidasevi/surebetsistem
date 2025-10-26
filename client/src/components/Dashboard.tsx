import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: #00ffff;
    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
  }
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #00ffff;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const BancasSection = styled.div`
  margin-top: 3rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 2rem;
  color: #00ffff;
  text-align: center;
`;

const BancasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const BancaCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
`;

const BancaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const BancaName = styled.h3`
  color: #fff;
  margin: 0;
`;

const BancaStatus = styled.span<{ positive: boolean }>`
  color: ${props => props.positive ? '#00ff00' : '#ff0040'};
  font-weight: bold;
`;

const ProgressBar = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  height: 8px;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  height: 100%;
  width: ${props => Math.min(props.width, 100)}%;
  transition: width 0.5s ease;
`;

const BancaStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  font-size: 0.9rem;
`;

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
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
        <Title>Carregando...</Title>
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

  return (
    <DashboardContainer>
      <Title>QUANTUM DASHBOARD</Title>
      
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatIcon>💰</StatIcon>
          <StatValue>{dashboardData.resumo.totalBancas}</StatValue>
          <StatLabel>Bancas Ativas</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatIcon>📈</StatIcon>
          <StatValue>{formatCurrency(dashboardData.resumo.saldoTotal)}</StatValue>
          <StatLabel>Saldo Total</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatIcon>🎯</StatIcon>
          <StatValue>{formatCurrency(dashboardData.resumo.lucroTotal)}</StatValue>
          <StatLabel>Lucro Total</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StatIcon>📊</StatIcon>
          <StatValue>{dashboardData.resumo.roi.toFixed(2)}%</StatValue>
          <StatLabel>ROI Médio</StatLabel>
        </StatCard>
      </StatsGrid>

      {dashboardData.bancas.length > 0 && (
        <BancasSection>
          <SectionTitle>PROGRESSO DAS BANCAS</SectionTitle>
          <BancasGrid>
            {dashboardData.bancas.map((banca: any, index: number) => {
              const progress = calculateProgress(banca);
              const roi = ((banca.saldo_atual / banca.valor_inicial - 1) * 100);
              const lucro = banca.saldo_atual - banca.valor_inicial;
              
              return (
                <BancaCard
                  key={banca.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <BancaHeader>
                    <BancaName>{banca.nome}</BancaName>
                    <BancaStatus positive={lucro >= 0}>
                      {lucro >= 0 ? '📈' : '📉'}
                    </BancaStatus>
                  </BancaHeader>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <span>Progresso da Meta</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <ProgressBar>
                      <ProgressFill width={progress} />
                    </ProgressBar>
                  </div>

                  <BancaStats>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.7)' }}>Saldo Atual</div>
                      <div style={{ fontWeight: 'bold', color: '#00ffff' }}>
                        {formatCurrency(banca.saldo_atual)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.7)' }}>ROI</div>
                      <div style={{ fontWeight: 'bold', color: roi >= 0 ? '#00ff00' : '#ff0040' }}>
                        {roi.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.7)' }}>Valor Inicial</div>
                      <div>{formatCurrency(banca.valor_inicial)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.7)' }}>Lucro/Prejuízo</div>
                      <div style={{ fontWeight: 'bold', color: lucro >= 0 ? '#00ff00' : '#ff0040' }}>
                        {formatCurrency(lucro)}
                      </div>
                    </div>
                  </BancaStats>
                </BancaCard>
              );
            })}
          </BancasGrid>
        </BancasSection>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;