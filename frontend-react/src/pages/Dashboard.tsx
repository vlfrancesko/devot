import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import { expenseAPI, analyticsAPI, authAPI } from '../services/api.ts';
import type { Expense } from '../types/index.ts';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

interface SummaryData {
  summary?: {
    total_spent: string;
    current_balance: string;
    spending_rate: string;
  };
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const expensesRes = await expenseAPI.getAll();
      setExpenses(expensesRes.data?.data || []);
      
      const summaryRes = await analyticsAPI.getSummary();
      setSummary(summaryRes.data || {});
    } catch (error) {
      console.error('Error loading data:', error);
      setExpenses([]);
      setSummary({});
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '140px auto 0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h1>Budget Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          <PowerSettingsNewIcon fontSize="small" />
        </button>
      </header>
      
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '18px', fontWeight: '500' }}>Welcome, {user?.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000', minHeight: '120px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#ffffff' }}>Current Balance</h3>
          <p style={{ fontSize: '28px', color: '#28a745', margin: '0', fontWeight: 'bold' }}>${parseFloat(user?.balance?.toString() || '0').toFixed(2)}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000', minHeight: '120px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#ffffff' }}>Monthly Spent</h3>
          <p style={{ fontSize: '28px', color: '#dc3545', margin: '0', fontWeight: 'bold' }}>${parseFloat(summary?.summary?.total_spent || '0').toFixed(2)}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000', minHeight: '120px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#ffffff' }}>Total Expenses</h3>
          <p style={{ fontSize: '28px', color: '#FF6D00', margin: '0', fontWeight: 'bold' }}>{expenses.length}</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Link 
          to="/expenses"
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#FF6D00', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: 'bold'
          }}
        >
          Manage Expenses
        </Link>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Recent Expenses</h3>
          <Link to="/expenses" style={{ color: '#FF6D00', textDecoration: 'none' }}>View All</Link>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
          {expenses.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No expenses yet</div>
          ) : (
            expenses.slice(0, 10).map(expense => (
              <div key={expense.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{expense.description}</strong>
                  <p style={{ margin: '5px 0', color: '#666' }}>{expense.category?.name || 'Unknown'} • {new Date(expense.expense_date).toLocaleDateString()}</p>
                </div>
                <div style={{ fontSize: '18px', color: '#dc3545' }}>
                  -${parseFloat(expense.amount?.toString() || '0').toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;