import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Surebet } from '../services/oddsApi';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #00ffff, #ff00ff);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #00ffff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const StatSubValue = styled.div`
  color: #ffff00;
  font-size: 0.8rem;
  margin-top: 0.3rem;
`;

interface SurebetStatsProps {
  surebets: Surebet[];
}

const SurebetStats: React.FC<SurebetStatsProps> = ({ surebets }) => {
  const totalSurebets = surebets.length;
  const avgProfit = surebets.length > 0 
    ? surebets.reduce((sum, sb) => sum + sb.profit, 0) / surebets.length 
    : 0;
  const maxProfit = surebets.length > 0 
    ? Math.max(...surebets.map(sb => sb.profit)) 
    : 0;
  const highProfitCount = surebets.filter(sb => sb.profit > 3).length;
  
  const sportsCount = new Set(surebets.map(sb => sb.sport)).size;
  const bookmakersCount = new Set(
    surebets.flatMap(sb => sb.odds.map(odd => odd.bookmaker))
  ).size;

  const stats = [
    {
      icon: '🎯',
      value: totalSurebets,
      label: 'Surebets Encontradas',
      subValue: `${highProfitCount} com +3%`
    },
    {
      icon: '📈',
      value: `${avgProfit.toFixed(2)}%`,
      label: 'Lucro Médio',
      subValue: `Máximo: ${maxProfit.toFixed(2)}%`
    },
    {
      icon: '⚽',
      value: sportsCount,
      label: 'Esportes Ativos',
      subValue: `${bookmakersCount} casas de apostas`
    },
    {
      icon: '💰',
      value: `${(avgProfit * totalSurebets).toFixed(1)}%`,
      label: 'Potencial Total',
      subValue: 'Soma dos lucros'
    }
  ];

  return (
    <StatsContainer>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <StatIcon>{stat.icon}</StatIcon>
          <StatValue>{stat.value}</StatValue>
          <StatLabel>{stat.label}</StatLabel>
          {stat.subValue && <StatSubValue>{stat.subValue}</StatSubValue>}
        </StatCard>
      ))}
    </StatsContainer>
  );
};

export default SurebetStats;