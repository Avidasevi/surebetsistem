import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CalculatorContainer = styled.div`
  max-width: 800px;
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

const ModeSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ModeButton = styled(motion.button)<{ active?: boolean }>`
  background: ${props => props.active ? 'linear-gradient(45deg, #00ffff, #ff00ff)' : 'transparent'};
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: ${props => props.active ? '#000' : '#fff'};
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
`;

const CalculatorCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 12px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }
`;

const CalculateButton = styled(motion.button)`
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: 100%;
  margin-bottom: 2rem;
`;

const ResultCard = styled(motion.div)`
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ResultItem = styled.div`
  text-align: center;
  
  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #00ff00;
  }
`;

const Calculator: React.FC = () => {
  const [mode, setMode] = useState<'2' | '3'>('2');
  const [odds, setOdds] = useState({ odd1: '', odd2: '', odd3: '' });
  const [stake, setStake] = useState('100');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const odd1 = parseFloat(odds.odd1);
    const odd2 = parseFloat(odds.odd2);
    const odd3 = mode === '3' ? parseFloat(odds.odd3) : 0;
    const totalStake = parseFloat(stake);

    if (!odd1 || !odd2 || (mode === '3' && !odd3) || !totalStake) {
      alert('Preencha todos os campos');
      return;
    }

    let margin, stake1, stake2, stake3 = 0;

    if (mode === '2') {
      margin = (1/odd1 + 1/odd2);
      stake1 = totalStake / (1 + odd2/odd1);
      stake2 = totalStake - stake1;
    } else {
      margin = (1/odd1 + 1/odd2 + 1/odd3);
      const total = 1/odd1 + 1/odd2 + 1/odd3;
      stake1 = totalStake * (1/odd1) / total;
      stake2 = totalStake * (1/odd2) / total;
      stake3 = totalStake * (1/odd3) / total;
    }

    const isSurebet = margin < 1;
    const marginPercent = ((1 - margin) * 100);
    const profit1 = (stake1 * odd1) - totalStake;
    const profit2 = (stake2 * odd2) - totalStake;
    const profit3 = mode === '3' ? (stake3 * odd3) - totalStake : 0;
    const guaranteedProfit = Math.min(profit1, profit2, mode === '3' ? profit3 : profit1);
    const roi = (guaranteedProfit / totalStake) * 100;

    setResult({
      isSurebet,
      margin: marginPercent,
      stakes: { stake1, stake2, stake3 },
      profits: { profit1, profit2, profit3 },
      guaranteedProfit,
      roi
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <CalculatorContainer>
      <Title>CALCULADORA QUÂNTICA</Title>
      
      <ModeSelector>
        <ModeButton
          active={mode === '2'}
          onClick={() => setMode('2')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          2 Resultados
        </ModeButton>
        <ModeButton
          active={mode === '3'}
          onClick={() => setMode('3')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          3 Resultados
        </ModeButton>
      </ModeSelector>

      <CalculatorCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <InputGrid>
          <InputGroup>
            <Label>Odd 1</Label>
            <Input
              type="number"
              step="0.01"
              value={odds.odd1}
              onChange={(e) => setOdds({...odds, odd1: e.target.value})}
              placeholder="1.50"
            />
          </InputGroup>
          <InputGroup>
            <Label>Odd 2</Label>
            <Input
              type="number"
              step="0.01"
              value={odds.odd2}
              onChange={(e) => setOdds({...odds, odd2: e.target.value})}
              placeholder="2.80"
            />
          </InputGroup>
          {mode === '3' && (
            <InputGroup>
              <Label>Odd 3</Label>
              <Input
                type="number"
                step="0.01"
                value={odds.odd3}
                onChange={(e) => setOdds({...odds, odd3: e.target.value})}
                placeholder="4.20"
              />
            </InputGroup>
          )}
          <InputGroup>
            <Label>Stake Total (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            />
          </InputGroup>
        </InputGrid>

        <CalculateButton
          onClick={calculate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Calcular Surebet
        </CalculateButton>

        {result && (
          <ResultCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: result.isSurebet ? '#00ff00' : '#ff0040' }}>
              {result.isSurebet ? '✅ SUREBET DETECTADA!' : '⚠️ NÃO É SUREBET'}
            </h3>
            
            <ResultGrid>
              <ResultItem>
                <div className="label">Margem</div>
                <div className="value">{result.margin.toFixed(4)}%</div>
              </ResultItem>
              <ResultItem>
                <div className="label">Lucro Garantido</div>
                <div className="value">{formatCurrency(result.guaranteedProfit)}</div>
              </ResultItem>
              <ResultItem>
                <div className="label">ROI</div>
                <div className="value">{result.roi.toFixed(2)}%</div>
              </ResultItem>
            </ResultGrid>

            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Stakes:</h4>
            <ResultGrid>
              <ResultItem>
                <div className="label">Aposta 1</div>
                <div className="value">{formatCurrency(result.stakes.stake1)}</div>
              </ResultItem>
              <ResultItem>
                <div className="label">Aposta 2</div>
                <div className="value">{formatCurrency(result.stakes.stake2)}</div>
              </ResultItem>
              {mode === '3' && (
                <ResultItem>
                  <div className="label">Aposta 3</div>
                  <div className="value">{formatCurrency(result.stakes.stake3)}</div>
                </ResultItem>
              )}
            </ResultGrid>
          </ResultCard>
        )}
      </CalculatorCard>
    </CalculatorContainer>
  );
};

export default Calculator;