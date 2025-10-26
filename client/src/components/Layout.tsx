import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavButton = styled(motion.button)<{ active?: boolean }>`
  background: ${props => props.active ? 'linear-gradient(45deg, #00ffff, #ff00ff)' : 'transparent'};
  border: 1px solid ${props => props.active ? 'transparent' : 'rgba(0, 255, 255, 0.3)'};
  color: ${props => props.active ? '#000' : '#fff'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const LogoutButton = styled(motion.button)`
  background: linear-gradient(45deg, #ff0040, #ff4080);
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/surebets', label: '🎯 Surebets' },
    { path: '/calculator', label: 'Calculadora' },
    { path: '/bancas', label: 'Bancas' },
    { path: '/apostas', label: 'Apostas' },
    ...(user?.isAdmin ? [{ path: '/admin', label: '🔴 Admin' }] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <LayoutContainer>
      <Header>
        <Logo>QUANTUM SUREBET</Logo>
        <Nav>
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </NavButton>
          ))}
        </Nav>
        <UserInfo>
          <span>{user?.email}</span>
          <LogoutButton
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sair
          </LogoutButton>
        </UserInfo>
      </Header>
      <Main>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </Main>
    </LayoutContainer>
  );
};

export default Layout;