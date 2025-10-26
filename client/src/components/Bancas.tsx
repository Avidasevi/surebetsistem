import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';

const BancasContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AddButton = styled(motion.button)`
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
`;

const BancasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const BancaCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: #00ffff;
    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 12px;
  color: #fff;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' 
    ? 'transparent' 
    : 'linear-gradient(45deg, #00ffff, #ff00ff)'};
  border: 1px solid ${props => props.variant === 'secondary' 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'transparent'};
  color: ${props => props.variant === 'secondary' ? '#fff' : '#000'};
  border-radius: 25px;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
`;

const Bancas: React.FC = () => {
  const [bancas, setBancas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    valor_inicial: '',
    meta_valor: '',
    meta_percentual: ''
  });

  useEffect(() => {
    loadBancas();
  }, []);

  const loadBancas = async () => {
    try {
      const response = await axios.get('/api/bancas');
      setBancas(response.data);
    } catch (error) {
      console.error('Erro ao carregar bancas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/bancas', {
        ...formData,
        valor_inicial: parseFloat(formData.valor_inicial),
        meta_valor: formData.meta_valor ? parseFloat(formData.meta_valor) : null,
        meta_percentual: formData.meta_percentual ? parseFloat(formData.meta_percentual) : null
      });
      
      setShowModal(false);
      setFormData({ nome: '', valor_inicial: '', meta_valor: '', meta_percentual: '' });
      loadBancas();
    } catch (error) {
      alert('Erro ao criar banca');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <BancasContainer>
      <Header>
        <Title>GERENCIAR BANCAS</Title>
        <AddButton
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Nova Banca
        </AddButton>
      </Header>

      <BancasGrid>
        {bancas.map((banca, index) => {
          const roi = ((banca.saldo_atual / banca.valor_inicial - 1) * 100);
          const lucro = banca.saldo_atual - banca.valor_inicial;
          
          return (
            <BancaCard
              key={banca.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 style={{ marginBottom: '1rem', color: '#00ffff' }}>{banca.nome}</h3>
              
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Valor Inicial:</span>
                  <span>{formatCurrency(banca.valor_inicial)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Saldo Atual:</span>
                  <span style={{ fontWeight: 'bold', color: lucro >= 0 ? '#00ff00' : '#ff0040' }}>
                    {formatCurrency(banca.saldo_atual)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Lucro/Prejuízo:</span>
                  <span style={{ fontWeight: 'bold', color: lucro >= 0 ? '#00ff00' : '#ff0040' }}>
                    {formatCurrency(lucro)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>ROI:</span>
                  <span style={{ fontWeight: 'bold', color: roi >= 0 ? '#00ff00' : '#ff0040' }}>
                    {roi.toFixed(2)}%
                  </span>
                </div>

                {banca.meta_valor && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Meta:</span>
                    <span>{formatCurrency(banca.meta_valor)}</span>
                  </div>
                )}

                {banca.meta_percentual && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Meta %:</span>
                    <span>{banca.meta_percentual}%</span>
                  </div>
                )}
              </div>
            </BancaCard>
          );
        })}
      </BancasGrid>

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
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#00ffff' }}>
              Nova Banca
            </h2>
            
            <Form onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Nome da Banca"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
              
              <Input
                type="number"
                step="0.01"
                placeholder="Valor Inicial (R$)"
                value={formData.valor_inicial}
                onChange={(e) => setFormData({...formData, valor_inicial: e.target.value})}
                required
              />
              
              <Input
                type="number"
                step="0.01"
                placeholder="Meta em Valor (R$) - Opcional"
                value={formData.meta_valor}
                onChange={(e) => setFormData({...formData, meta_valor: e.target.value})}
              />
              
              <Input
                type="number"
                step="0.1"
                placeholder="Meta em Percentual (%) - Opcional"
                value={formData.meta_percentual}
                onChange={(e) => setFormData({...formData, meta_percentual: e.target.value})}
              />
              
              <ButtonGroup>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Criar Banca
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </BancasContainer>
  );
};

export default Bancas;