import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Expenses from './pages/Expenses.tsx';
import Analytics from './pages/Analytics.tsx';
import logo from './assets/logo.svg';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import './App.css';

function Navigation() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: '#000000' }}>
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#000000' }}>
        <img src={logo} alt="Devot Logo" style={{ height: '48px', width: 'auto' }} />
      </div>
      <nav style={{ 
        padding: '10px 20px', 
        backgroundColor: '#000000', 
        borderBottom: '1px solid #ddd',
        marginBottom: '0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#FF6D00', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', padding: '8px 12px' }}>
            <DashboardIcon fontSize="medium" />Dashboard
          </Link>
          <Link to="/expenses" style={{ textDecoration: 'none', color: '#FF6D00', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', padding: '8px 12px' }}>
            <AccountBalanceWalletIcon fontSize="medium" />Expenses
          </Link>
          <Link to="/analytics" style={{ textDecoration: 'none', color: '#FF6D00', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', padding: '8px 12px' }}>
            <AnalyticsIcon fontSize="medium" />Analytics
          </Link>
        </div>
      </nav>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
      />
      <Route 
        path="/" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/expenses" 
        element={isAuthenticated ? <Expenses /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/analytics" 
        element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
