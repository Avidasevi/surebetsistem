import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const CalculatorContainer = styled.div`
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
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
`;

const ModeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ModeCard = styled(motion.div)<{ active?: boolean }>`
  background: ${props => props.active ? 
    'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))' : 
    'var(--glass)'};
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.active ? 'var(--primary)' : 'var(--glass-border)'};
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? 
    '0 0 30px rgba(0, 255, 255, 0.4)' : 
    '0 8px 32px rgba(0, 0, 0, 0.3)'};

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
    box-shadow: 0 15px 40px rgba(0, 255, 255, 0.3);
  }
`;

const CalculatorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InputSection = styled(motion.div)`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
`;

const ResultSection = styled(motion.div)`
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 255, 255, 0.1));
  backdrop-filter: blur(20px);
  border: 1px solid var(--success);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.2);
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 15px;
  padding: 15px;
  color: var(--text-primary);
  font-size: 16px;
  font-family: 'Rajdhani', sans-serif;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    background: rgba(0, 255, 255, 0.05);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const CalculateButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(45deg, var(--primary), var(--secondary));
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  color: var(--bg-primary);
  font-weight: 700;
  font-family: 'Orbitron', monospace;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  margin-bottom: 1rem;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ResultCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 15px;
  padding: 1rem;
  text-align: center;
`;

const ResultValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--success);
  margin-bottom: 0.5rem;
`;

const ResultLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatusIndicator = styled.div<{ isSurebet: boolean }>`
  text-align: center;
  padding: 1rem;
  border-radius: 15px;
  margin-bottom: 1rem;
  background: ${props => props.isSurebet ? 
    'linear-gradient(135deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 255, 0.2))' :
    'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(255, 128, 0, 0.2))'};
  border: 1px solid ${props => props.isSurebet ? 'var(--success)' : 'var(--warning)'};
  
  .status-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .status-text {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.isSurebet ? 'var(--success)' : 'var(--warning)'};
  }
`;

const HistorySection = styled.div`
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
`;

const HistoryGrid = styled.div`
  display: grid;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
`;

const HistoryItem = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 15px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary);
    transform: translateX(5px);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
`;

const ActionButton = styled(motion.button)<{ variant?: string }>`
  background: ${props => {
    switch(props.variant) {
      case 'success': return 'linear-gradient(45deg, var(--success), #00cc33)';
      case 'warning': return 'linear-gradient(45deg, var(--warning), #cc6600)';
      case 'danger': return 'linear-gradient(45deg, var(--danger), #cc0033)';
      default: return 'linear-gradient(45deg, var(--primary), var(--secondary))';
    }
  }};
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  color: var(--bg-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

interface CalculationResult {
  isSurebet: boolean;
  margin: number;
  stakes: number[];
  profits: number[];
  guaranteedProfit: number;
  roi: number;
  totalStake: number;
  odds: number[];
  type: string;
  timestamp: Date;
}

const AdvancedCalculator: React.FC = () => {
  const [mode, setMode] = useState<'2' | '3' | 'arbitrage' | 'value'>('2');
  const [odds, setOdds] = useState<number[]>([0, 0, 0]);
  const [stake, setStake] = useState<number>(100);
  const [targetProfit, setTargetProfit] = useState<number>(0);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axios.get('/api/calculos');
      setHistory(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const calculate = async () => {
    setLoading(true);
    
    try {
      const validOdds = odds.slice(0, mode === '2' ? 2 : 3).filter(odd => odd > 1);
      
      if (validOdds.length < (mode === '2' ? 2 : 3)) {
        throw new Error('Preencha todas as odds válidas (> 1.00)');
      }

      let margin: number;
      let stakes: number[];
      let profits: number[];

      if (mode === '2') {
        margin = (1/validOdds[0] + 1/validOdds[1]);
        if (targetProfit > 0) {
          const totalReturn = stake + targetProfit;
          stakes = [totalReturn / validOdds[0], totalReturn / validOdds[1]];
        } else {
          stakes = [
            stake / (1 + validOdds[1]/validOdds[0]),
            stake - (stake / (1 + validOdds[1]/validOdds[0]))
          ];
        }
      } else {
        margin = (1/validOdds[0] + 1/validOdds[1] + 1/validOdds[2]);
        const total = 1/validOdds[0] + 1/validOdds[1] + 1/validOdds[2];
        stakes = [
          stake * (1/validOdds[0]) / total,
          stake * (1/validOdds[1]) / total,
          stake * (1/validOdds[2]) / total
        ];
      }

      profits = stakes.map((s, i) => (s * validOdds[i]) - stake);
      const guaranteedProfit = Math.min(...profits);
      const roi = (guaranteedProfit / stake) * 100;
      const isSurebet = margin < 1;

      const calculationResult: CalculationResult = {
        isSurebet,
        margin: ((1 - margin) * 100),
        stakes,
        profits,
        guaranteedProfit,
        roi,
        totalStake: stakes.reduce((sum, s) => sum + s, 0),
        odds: validOdds,
        type: `${mode} Resultados`,
        timestamp: new Date()
      };

      setResult(calculationResult);

      // Salvar no histórico
      await axios.post('/api/calculos', {
        tipo: mode,
        odds: validOdds,
        stake,
        resultado: calculationResult
      });

      loadHistory();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const saveToFavorites = async () => {
    if (!result) return;
    
    const name = prompt('Nome para este cálculo:');
    if (name) {
      try {
        await axios.post('/api/calculos/favorito', {
          ...result,
          nome: name,
          favorito: true
        });
        alert('Cálculo salvo nos favoritos!');
        loadHistory();
      } catch (error) {
        alert('Erro ao salvar favorito');
      }
    }
  };

  const copyResult = () => {
    if (!result) return;
    
    const text = `
🎯 QUANTUM SUREBET CALCULATOR
${result.isSurebet ? '✅ SUREBET DETECTADA!' : '⚠️ NÃO É SUREBET'}

📊 Odds: ${result.odds.join(' | ')}
💰 Stake Total: R$ ${result.totalStake.toFixed(2)}
🎯 Lucro Garantido: R$ ${result.guaranteedProfit.toFixed(2)}
📈 ROI: ${result.roi.toFixed(2)}%
📉 Margem: ${result.margin.toFixed(4)}%

Stakes:
${result.stakes.map((stake, i) => `Aposta ${i+1}: R$ ${stake.toFixed(2)}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Resultado copiado!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <CalculatorContainer>
      <Title className="neon-text">QUANTUM CALCULATOR</Title>
      
      <ModeGrid>
        {[
          { key: '2', title: '2 Resultados', icon: '⚡', desc: 'Surebet clássica' },
          { key: '3', title: '3 Resultados', icon: '🔥', desc: 'Tripla arbitragem' },
          { key: 'arbitrage', title: 'Arbitragem', icon: '💎', desc: 'Análise avançada' },
          { key: 'value', title: 'Value Bet', icon: '🚀', desc: 'Apostas de valor' }
        ].map((modeOption) => (
          <ModeCard
            key={modeOption.key}
            active={mode === modeOption.key}
            onClick={() => setMode(modeOption.key as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{modeOption.icon}</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{modeOption.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{modeOption.desc}</p>
          </ModeCard>
        ))}
      </ModeGrid>

      <CalculatorGrid>
        <InputSection
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
            📊 Configuração
          </h3>
          
          <InputGrid>
            {Array.from({ length: mode === '2' ? 2 : 3 }, (_, i) => (
              <InputGroup key={i}>
                <Label>Odd {i + 1}</Label>
                <Input
                  type="number"
                  step="0.001"
                  placeholder={`${(1.5 + i * 0.3).toFixed(2)}`}
                  value={odds[i] || ''}
                  onChange={(e) => {
                    const newOdds = [...odds];
                    newOdds[i] = parseFloat(e.target.value) || 0;
                    setOdds(newOdds);
                  }}
                />
              </InputGroup>
            ))}
            
            <InputGroup>
              <Label>Stake Total (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
              />
            </InputGroup>
            
            <InputGroup>
              <Label>Lucro Alvo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Opcional"
                value={targetProfit || ''}
                onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)}
              />
            </InputGroup>
          </InputGrid>

          <CalculateButton
            onClick={calculate}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '🔄 CALCULANDO...' : '⚡ CALCULAR SUREBET'}
          </CalculateButton>
        </InputSection>

        <AnimatePresence>
          {result && (
            <ResultSection
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--success)' }}>
                🎯 Resultado
              </h3>

              <StatusIndicator isSurebet={result.isSurebet}>
                <div className="status-icon">
                  {result.isSurebet ? '✅' : '⚠️'}
                </div>
                <div className="status-text">
                  {result.isSurebet ? 'SUREBET DETECTADA!' : 'NÃO É SUREBET'}
                </div>
                <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
                  Margem: {result.margin.toFixed(4)}%
                </div>
              </StatusIndicator>

              <ResultGrid>
                <ResultCard>
                  <ResultValue>{result.roi.toFixed(2)}%</ResultValue>
                  <ResultLabel>ROI</ResultLabel>
                </ResultCard>
                <ResultCard>
                  <ResultValue>{formatCurrency(result.guaranteedProfit)}</ResultValue>
                  <ResultLabel>Lucro</ResultLabel>
                </ResultCard>
                <ResultCard>
                  <ResultValue>{formatCurrency(result.totalStake)}</ResultValue>
                  <ResultLabel>Total</ResultLabel>
                </ResultCard>
              </ResultGrid>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Stakes Recomendadas:
                </h4>
                {result.stakes.map((stake, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    marginBottom: '0.5rem'
                  }}>
                    <span>Aposta {i + 1} (Odd {result.odds[i]}):</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                      {formatCurrency(stake)}
                    </span>
                  </div>
                ))}
              </div>

              <ActionButtons>
                <ActionButton
                  variant="success"
                  onClick={saveToFavorites}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⭐ Favoritar
                </ActionButton>
                <ActionButton
                  onClick={copyResult}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📋 Copiar
                </ActionButton>
                <ActionButton
                  variant="warning"
                  onClick={() => setResult(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🗑️ Limpar
                </ActionButton>
              </ActionButtons>
            </ResultSection>
          )}
        </AnimatePresence>
      </CalculatorGrid>

      <HistorySection>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
          📚 Histórico de Cálculos
        </h3>
        <HistoryGrid>
          {history.slice(0, 10).map((calc, index) => (
            <HistoryItem
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setResult(calc)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{calc.type}</strong>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    ROI: {calc.roi.toFixed(2)}% | Lucro: {formatCurrency(calc.guaranteedProfit)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem' }}>
                    {calc.isSurebet ? '✅' : '⚠️'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(calc.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </HistoryItem>
          ))}
        </HistoryGrid>
      </HistorySection>
    </CalculatorContainer>
  );
};

export default AdvancedCalculator;