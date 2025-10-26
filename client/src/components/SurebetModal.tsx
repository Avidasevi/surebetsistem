import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Surebet } from '../services/oddsApi';
import OddsApiService from '../services/oddsApi';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
`;

const Modal = styled(motion.div)`
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
`;

const Title = styled.h2`
  color: #00ffff;
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled(motion.button)`
  background: transparent;
  border: 1px solid rgba(255, 0, 64, 0.5);
  color: #ff0040;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const MatchInfo = styled.div`
  margin-bottom: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
`;

const ProfitHighlight = styled.div`
  background: linear-gradient(45deg, #00ff00, #40ff40);
  color: #000;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: bold;
  font-size: 1.2rem;
`;

const StakeSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #00ffff;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const StakeInput = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.8rem;
  color: #fff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
`;

const OddsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const OddCard = styled.div`
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 1rem;
`;

const OddHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const OutcomeName = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
`;

const BookmakerName = styled.div`
  color: #00ffff;
  font-size: 0.9rem;
`;

const OddValue = styled.div`
  color: #fff;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StakeInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  font-size: 0.9rem;
`;

const StakeValue = styled.div`
  color: #ffff00;
  font-weight: bold;
`;

const PotentialReturn = styled.div`
  color: #00ff00;
  font-weight: bold;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(45deg, #00ffff, #0080ff)' 
    : 'transparent'};
  border: 1px solid ${props => props.variant === 'primary' ? 'transparent' : 'rgba(0, 255, 255, 0.5)'};
  color: ${props => props.variant === 'primary' ? '#000' : '#00ffff'};
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
`;

interface SurebetModalProps {
  surebet: Surebet;
  isOpen: boolean;
  onClose: () => void;
}

const SurebetModal: React.FC<SurebetModalProps> = ({ surebet, isOpen, onClose }) => {
  const [totalStake, setTotalStake] = useState<number>(100);
  const oddsService = new OddsApiService('82bf1568dc202ca84c3c4ff83c894daa');

  const stakes = oddsService.calculateOptimalStakes(surebet, totalStake);

  const copyToClipboard = () => {
    const text = `
🎯 SUREBET DETECTADA
${surebet.homeTeam} vs ${surebet.awayTeam}
Lucro: +${surebet.profit}%
Esporte: ${surebet.sport}

📊 STAKES CALCULADAS (R$ ${totalStake}):
${surebet.odds.map(odd => 
  `${odd.outcome}: R$ ${stakes[odd.outcome]} @ ${odd.odd} (${odd.bookmaker})`
).join('\n')}

🏆 Retorno Garantido: R$ ${(totalStake * (1 + surebet.profit / 100)).toFixed(2)}
    `;
    
    navigator.clipboard.writeText(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Modal
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>Detalhes da Surebet</Title>
              <CloseButton
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </CloseButton>
            </Header>

            <MatchInfo>
              <InfoRow>
                <span>Partida:</span>
                <span>{surebet.homeTeam} vs {surebet.awayTeam}</span>
              </InfoRow>
              <InfoRow>
                <span>Esporte:</span>
                <span>{surebet.sport}</span>
              </InfoRow>
              <InfoRow>
                <span>Início:</span>
                <span>{new Date(surebet.commenceTime).toLocaleString('pt-BR')}</span>
              </InfoRow>
              <InfoRow>
                <span>Probabilidade Total:</span>
                <span>{(surebet.totalImpliedProbability * 100).toFixed(2)}%</span>
              </InfoRow>
            </MatchInfo>

            <ProfitHighlight>
              Lucro Garantido: +{surebet.profit}%
            </ProfitHighlight>

            <StakeSection>
              <SectionTitle>Calculadora de Stakes</SectionTitle>
              <StakeInput>
                <Label>Valor Total a Apostar (R$)</Label>
                <Input
                  type="number"
                  value={totalStake}
                  onChange={(e) => setTotalStake(Number(e.target.value) || 0)}
                  min="1"
                  step="1"
                />
              </StakeInput>

              <OddsGrid>
                {surebet.odds.map((odd, index) => (
                  <OddCard key={index}>
                    <OddHeader>
                      <OutcomeName>{odd.outcome}</OutcomeName>
                      <BookmakerName>{odd.bookmaker}</BookmakerName>
                    </OddHeader>
                    <OddValue>@{odd.odd.toFixed(2)}</OddValue>
                    <StakeInfo>
                      <div>
                        <div>Apostar:</div>
                        <StakeValue>R$ {stakes[odd.outcome]}</StakeValue>
                      </div>
                      <div>
                        <div>Retorno:</div>
                        <PotentialReturn>R$ {(stakes[odd.outcome] * odd.odd).toFixed(2)}</PotentialReturn>
                      </div>
                    </StakeInfo>
                  </OddCard>
                ))}
              </OddsGrid>

              <InfoRow>
                <span><strong>Lucro Líquido:</strong></span>
                <span style={{ color: '#00ff00', fontWeight: 'bold' }}>
                  R$ {(totalStake * surebet.profit / 100).toFixed(2)}
                </span>
              </InfoRow>
            </StakeSection>

            <ActionButtons>
              <Button
                variant="secondary"
                onClick={copyToClipboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Copiar Detalhes
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fechar
              </Button>
            </ActionButtons>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default SurebetModal;