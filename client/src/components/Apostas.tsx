import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';

const ApostasContainer = styled.div`
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

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9rem;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
`;

const Tr = styled.tr`
  &:hover {
    background: rgba(0, 255, 255, 0.05);
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  
  ${props => {
    switch(props.status) {
      case 'ganhou':
        return 'background: rgba(0, 255, 0, 0.2); color: #00ff00; border: 1px solid #00ff00;';
      case 'perdeu':
        return 'background: rgba(255, 0, 64, 0.2); color: #ff0040; border: 1px solid #ff0040;';
      case 'reembolsada':
        return 'background: rgba(255, 128, 0, 0.2); color: #ff8000; border: 1px solid #ff8000;';
      default:
        return 'background: rgba(255, 255, 255, 0.1); color: #fff;';
    }
  }}
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
  max-height: 90vh;
  overflow-y: auto;
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

const Select = styled.select`
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

  option {
    background: #1a1a2e;
    color: #fff;
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

const Apostas: React.FC = () => {
  const [apostas, setApostas] = useState<any[]>([]);
  const [bancas, setBancas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    banca_id: '',
    data_aposta: new Date().toISOString().split('T')[0],
    valor_apostado: '',
    casa_aposta: '',
    tipo_aposta: 'surebet',
    odd: '',
    resultado: 'ganhou',
    valor_recebido: ''
  });

  useEffect(() => {
    loadApostas();
    loadBancas();
  }, []);

  const loadApostas = async () => {
    try {
      const response = await axios.get('/api/apostas');
      setApostas(response.data);
    } catch (error) {
      console.error('Erro ao carregar apostas:', error);
    }
  };

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
      await axios.post('/api/apostas', {
        ...formData,
        banca_id: parseInt(formData.banca_id),
        valor_apostado: parseFloat(formData.valor_apostado),
        odd: parseFloat(formData.odd),
        valor_recebido: parseFloat(formData.valor_recebido) || 0
      });
      
      setShowModal(false);
      setFormData({
        banca_id: '',
        data_aposta: new Date().toISOString().split('T')[0],
        valor_apostado: '',
        casa_aposta: '',
        tipo_aposta: 'surebet',
        odd: '',
        resultado: 'ganhou',
        valor_recebido: ''
      });
      loadApostas();
    } catch (error) {
      alert('Erro ao registrar aposta');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleResultadoChange = (resultado: string) => {
    setFormData(prev => {
      const valorApostado = parseFloat(prev.valor_apostado) || 0;
      const odd = parseFloat(prev.odd) || 0;
      
      let valorRecebido = '0';
      if (resultado === 'ganhou') {
        valorRecebido = (valorApostado * odd).toFixed(2);
      } else if (resultado === 'reembolsada') {
        valorRecebido = valorApostado.toFixed(2);
      }
      
      return {
        ...prev,
        resultado,
        valor_recebido: valorRecebido
      };
    });
  };

  return (
    <ApostasContainer>
      <Header>
        <Title>GERENCIAR APOSTAS</Title>
        <AddButton
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Nova Aposta
        </AddButton>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Data</Th>
              <Th>Banca</Th>
              <Th>Casa</Th>
              <Th>Tipo</Th>
              <Th>Valor</Th>
              <Th>Odd</Th>
              <Th>Resultado</Th>
              <Th>Lucro</Th>
            </tr>
          </thead>
          <tbody>
            {apostas.map((aposta) => (
              <Tr key={aposta.id}>
                <Td>{formatDate(aposta.data_aposta)}</Td>
                <Td>{aposta.banca_nome}</Td>
                <Td>{aposta.casa_aposta}</Td>
                <Td style={{ textTransform: 'capitalize' }}>{aposta.tipo_aposta}</Td>
                <Td>{formatCurrency(aposta.valor_apostado)}</Td>
                <Td>{parseFloat(aposta.odd).toFixed(2)}</Td>
                <Td>
                  <StatusBadge status={aposta.resultado}>
                    {aposta.resultado}
                  </StatusBadge>
                </Td>
                <Td style={{ 
                  fontWeight: 'bold', 
                  color: aposta.lucro >= 0 ? '#00ff00' : '#ff0040' 
                }}>
                  {formatCurrency(aposta.lucro)}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

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
              Nova Aposta
            </h2>
            
            <Form onSubmit={handleSubmit}>
              <Select
                value={formData.banca_id}
                onChange={(e) => setFormData({...formData, banca_id: e.target.value})}
                required
              >
                <option value="">Selecione uma banca</option>
                {bancas.map(banca => (
                  <option key={banca.id} value={banca.id}>
                    {banca.nome} ({formatCurrency(banca.saldo_atual)})
                  </option>
                ))}
              </Select>
              
              <Input
                type="date"
                value={formData.data_aposta}
                onChange={(e) => setFormData({...formData, data_aposta: e.target.value})}
                required
              />
              
              <Input
                type="number"
                step="0.01"
                placeholder="Valor Apostado (R$)"
                value={formData.valor_apostado}
                onChange={(e) => setFormData({...formData, valor_apostado: e.target.value})}
                required
              />
              
              <Input
                type="text"
                placeholder="Casa de Aposta"
                value={formData.casa_aposta}
                onChange={(e) => setFormData({...formData, casa_aposta: e.target.value})}
                required
              />
              
              <Select
                value={formData.tipo_aposta}
                onChange={(e) => setFormData({...formData, tipo_aposta: e.target.value})}
              >
                <option value="surebet">Surebet</option>
                <option value="simples">Simples</option>
                <option value="multipla">Múltipla</option>
                <option value="ao_vivo">Ao Vivo</option>
                <option value="pre_jogo">Pré-jogo</option>
              </Select>
              
              <Input
                type="number"
                step="0.01"
                placeholder="Odd"
                value={formData.odd}
                onChange={(e) => setFormData({...formData, odd: e.target.value})}
                required
              />
              
              <Select
                value={formData.resultado}
                onChange={(e) => handleResultadoChange(e.target.value)}
              >
                <option value="ganhou">Ganhou</option>
                <option value="perdeu">Perdeu</option>
                <option value="reembolsada">Reembolsada</option>
              </Select>
              
              <Input
                type="number"
                step="0.01"
                placeholder="Valor Recebido (R$)"
                value={formData.valor_recebido}
                onChange={(e) => setFormData({...formData, valor_recebido: e.target.value})}
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
                  Registrar
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </ApostasContainer>
  );
};

export default Apostas;