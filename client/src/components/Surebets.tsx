import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import OddsApiService, { Surebet } from '../services/oddsApi';
import SurebetModal from './SurebetModal';
import SurebetStats from './SurebetStats';
import SurebetNotifications from './SurebetNotifications';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 40, 0.9));
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  border: 1px solid rgba(0, 255, 255, 0.2);
`;

const RefreshButton = styled(motion.button)`
  background: linear-gradient(45deg, #00ffff, #0080ff);
  border: none;
  color: #000;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: #00ffff;
  font-weight: 600;
  font-size: 0.9rem;
`;

const FilterInput = styled.input`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
`;

const FilterSelect = styled.select`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
  
  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const LoadingSpinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 255, 255, 0.3);
  border-top: 3px solid #00ffff;
  border-radius: 50%;
`;

const SurebetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const SurebetCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  min-height: 400px;
  
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

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MatchTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  margin: 0;
`;

const ProfitBadge = styled.div<{ profit: number }>`
  background: ${props => props.profit > 5 ? 'linear-gradient(45deg, #00ff00, #40ff40)' : 
                       props.profit > 2 ? 'linear-gradient(45deg, #ffff00, #ffff80)' : 
                       'linear-gradient(45deg, #ff8000, #ffb366)'};
  color: #000;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
`;

const MatchInfo = styled.div`
  margin-bottom: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.1);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const OddsContainer = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const OddCard = styled.div`
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 1rem;
`;

const BookmakerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const BookmakerName = styled.div`
  color: #00ffff;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
`;

const OutcomeInfo = styled.div`
  text-align: center;
`;

const OutcomeName = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
`;

const OddValue = styled.div`
  color: #ffff00;
  font-size: 1.3rem;
  font-weight: bold;
  background: rgba(255, 255, 0, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 0, 0.3);
`;

const BetInstruction = styled.div`
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  text-align: center;
  font-size: 0.8rem;
  color: #00ff00;
  font-weight: 600;
`;

const SportBadge = styled.div`
  background: linear-gradient(45deg, #ff00ff, #ff4080);
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const DateTimeInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const DateTime = styled.div`
  color: #00ffff;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
`;

const TimeUntil = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
`;

const ActionButton = styled(motion.button)`
  background: linear-gradient(45deg, #00ffff, #0080ff);
  border: none;
  color: #000;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
`;

const NoResults = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
  margin-top: 3rem;
`;



const Surebets: React.FC = () => {
  const [surebets, setSurebets] = useState<Surebet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurebet, setSelectedSurebet] = useState<Surebet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    sport: '',
    minProfit: '',
    maxProfit: '',
    bookmaker: '',
    league: ''
  });
  const previousSurebets = useRef<Surebet[]>([]);

  const oddsService = new OddsApiService('82bf1568dc202ca84c3c4ff83c894daa');

  const fetchSurebets = async () => {
    setLoading(true);
    try {
      const sports = await oddsService.getSports();
      const activeSports = sports.filter(sport => sport.active).slice(0, 5);
      
      const allSurebets: Surebet[] = [];
      
      for (const sport of activeSports) {
        try {
          const matches = await oddsService.getOdds(sport.key);
          const sportSurebets = oddsService.findSurebets(matches);
          allSurebets.push(...sportSurebets);
        } catch (error) {
          console.error(`Erro ao buscar odds para ${sport.key}:`, error);
        }
      }
      
      // Atualizar referência anterior antes de definir novos dados
      previousSurebets.current = surebets;
      setSurebets(allSurebets);
    } catch (error) {
      console.error('Erro ao buscar surebets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurebets();
    const interval = setInterval(fetchSurebets, 60000); // Atualizar a cada 1 minuto
    return () => clearInterval(interval);
  }, []);

  const filteredSurebets = surebets.filter(surebet => {
    if (filters.sport && !surebet.sport.toLowerCase().includes(filters.sport.toLowerCase())) return false;
    if (filters.league && !surebet.league.toLowerCase().includes(filters.league.toLowerCase())) return false;
    if (filters.minProfit && surebet.profit < Number(filters.minProfit)) return false;
    if (filters.maxProfit && surebet.profit > Number(filters.maxProfit)) return false;
    if (filters.bookmaker && !surebet.odds.some(odd => 
      odd.bookmaker.toLowerCase().includes(filters.bookmaker.toLowerCase())
    )) return false;
    return true;
  });

  return (
    <Container>
      <Header>
        <Title>🎯 SUREBETS DETECTOR</Title>
        <Subtitle>
          Oportunidades de Arbitragem em Tempo Real
          {!loading && (
            <motion.span 
              style={{ 
                display: 'block', 
                fontSize: '0.8rem', 
                color: 'rgba(0, 255, 255, 0.7)',
                marginTop: '0.5rem'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🟢 API Ativa - Atualização automática a cada minuto - Última: {new Date().toLocaleTimeString('pt-BR')}
            </motion.span>
          )}
        </Subtitle>
      </Header>

      <SurebetStats surebets={filteredSurebets} />

      <RefreshButton
        onClick={fetchSurebets}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.05 }}
        whileTap={{ scale: loading ? 1 : 0.95 }}
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ↻
            </motion.span>
            Atualizando...
          </>
        ) : (
          <>
            🔄 Atualizar Surebets
          </>
        )}
      </RefreshButton>

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Esporte</FilterLabel>
          <FilterInput
            type="text"
            placeholder="Filtrar por esporte..."
            value={filters.sport}
            onChange={(e) => setFilters({...filters, sport: e.target.value})}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Liga</FilterLabel>
          <FilterInput
            type="text"
            placeholder="Filtrar por liga..."
            value={filters.league}
            onChange={(e) => setFilters({...filters, league: e.target.value})}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Lucro Mínimo (%)</FilterLabel>
          <FilterInput
            type="number"
            step="0.1"
            placeholder="Ex: 1.5"
            value={filters.minProfit}
            onChange={(e) => setFilters({...filters, minProfit: e.target.value})}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Lucro Máximo (%)</FilterLabel>
          <FilterInput
            type="number"
            step="0.1"
            placeholder="Ex: 10"
            value={filters.maxProfit}
            onChange={(e) => setFilters({...filters, maxProfit: e.target.value})}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Casa de Apostas</FilterLabel>
          <FilterInput
            type="text"
            placeholder="Filtrar por bookmaker..."
            value={filters.bookmaker}
            onChange={(e) => setFilters({...filters, bookmaker: e.target.value})}
          />
        </FilterGroup>
      </FiltersContainer>

      {loading ? (
        <LoadingContainer>
          <LoadingSpinner
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </LoadingContainer>
      ) : (
        <AnimatePresence>
          {filteredSurebets.length > 0 ? (
            <SurebetsGrid>
              {filteredSurebets.map((surebet, index) => (
                <SurebetCard
                  key={surebet.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <SportBadge>{surebet.sport}</SportBadge>
                  
                  <CardHeader>
                    <MatchTitle>{surebet.homeTeam} vs {surebet.awayTeam}</MatchTitle>
                    <ProfitBadge profit={surebet.profit}>
                      +{surebet.profit}%
                    </ProfitBadge>
                  </CardHeader>
                  
                  <DateTimeInfo>
                    <DateTime>
                      📅 {new Date(surebet.commenceTime).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </DateTime>
                    <DateTime>
                      🕐 {new Date(surebet.commenceTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </DateTime>
                    <TimeUntil>
                      {(() => {
                        const now = new Date();
                        const gameTime = new Date(surebet.commenceTime);
                        const diffMs = gameTime.getTime() - now.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        
                        if (diffMs < 0) return '⚠️ Jogo já iniciado';
                        if (diffHours < 1) return `⏰ Inicia em ${diffMins}min`;
                        if (diffHours < 24) return `⏰ Inicia em ${diffHours}h ${diffMins}min`;
                        return `⏰ Inicia em ${Math.floor(diffHours/24)}d ${diffHours%24}h`;
                      })()
                    }
                    </TimeUntil>
                  </DateTimeInfo>
                  
                  <MatchInfo>
                    <InfoRow>
                      <span><strong>Liga:</strong></span>
                      <span>{surebet.league}</span>
                    </InfoRow>
                    <InfoRow>
                      <span><strong>Probabilidade Total:</strong></span>
                      <span>{(surebet.totalImpliedProbability * 100).toFixed(2)}%</span>
                    </InfoRow>
                  </MatchInfo>
                  
                  <OddsContainer>
                    {surebet.odds.map((odd, idx) => (
                      <OddCard key={idx}>
                        <BookmakerInfo>
                          <BookmakerName>🏢 {odd.bookmaker}</BookmakerName>
                          <BetInstruction>APOSTE AQUI</BetInstruction>
                        </BookmakerInfo>
                        
                        <OutcomeInfo>
                          <OutcomeName>{odd.outcome}</OutcomeName>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                            {((1/odd.odd)*100).toFixed(1)}% prob.
                          </div>
                        </OutcomeInfo>
                        
                        <OddValue>@{odd.odd.toFixed(2)}</OddValue>
                      </OddCard>
                    ))}
                  </OddsContainer>
                  
                  <ActionButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedSurebet(surebet);
                      setModalOpen(true);
                    }}
                  >
                    💰 Calcular Stakes Otimizadas
                  </ActionButton>
                </SurebetCard>
              ))}
            </SurebetsGrid>
          ) : (
            <NoResults>
              {loading ? 'Carregando surebets...' : 'Nenhuma surebet encontrada com os filtros aplicados'}
            </NoResults>
          )}
        </AnimatePresence>
      )}
      
      {selectedSurebet && (
        <SurebetModal
          surebet={selectedSurebet}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedSurebet(null);
          }}
        />
      )}
      
      <SurebetNotifications 
        surebets={surebets}
        previousSurebets={previousSurebets.current}
      />
    </Container>
  );
};

export default Surebets;