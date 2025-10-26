import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalStyle } from './styles/GlobalStyle';
import Login from './components/Login';
import EnhancedDashboard from './components/EnhancedDashboard';
import AdvancedCalculator from './components/AdvancedCalculator';
import Bancas from './components/Bancas';
import Apostas from './components/Apostas';
import SuperAdminPanel from './components/SuperAdminPanel';
import Surebets from './components/Surebets';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <EnhancedDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/surebets" element={
            <ProtectedRoute>
              <Layout>
                <Surebets />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/calculator" element={
            <ProtectedRoute>
              <Layout>
                <AdvancedCalculator />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/bancas" element={
            <ProtectedRoute>
              <Layout>
                <Bancas />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/apostas" element={
            <ProtectedRoute>
              <Layout>
                <Apostas />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout>
                <SuperAdminPanel />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;