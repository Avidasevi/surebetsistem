import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 15px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  border: none;
  border-radius: 25px;
  padding: 15px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ToggleText = styled.p`
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.7);
  
  span {
    color: #00ffff;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        await register(email, password);
        setIsLogin(true);
        alert('Conta criada! Faça login.');
      }
    } catch (error) {
      alert('Erro: ' + (error as any).response?.data?.error || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>QUANTUM SUREBET</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'PROCESSANDO...' : (isLogin ? 'ENTRAR' : 'REGISTRAR')}
          </Button>
        </Form>
        <ToggleText>
          {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Registre-se' : 'Faça login'}
          </span>
        </ToggleText>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;