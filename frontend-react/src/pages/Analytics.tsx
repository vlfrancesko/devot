import React, { useState, useEffect } from 'react';
import { analyticsAPI, authAPI } from '../services/api.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

interface SummaryData {
  summary?: {
    current_balance: string;
    total_spent: string;
    spending_rate: string;
  };
  spending_by_category: Array<{ name: string; total: string }>;
  daily_spending: Array<{ date: string; total: string }>;
}

interface TrendsData {
  top_categories: Array<{ name: string; total: string }>;
  monthly_spending: Array<{ period: string; total: string }>;
}

interface BudgetStatusData {
  budget_health: string;
  monthly_spent: string;
  avg_daily_spending: string;
  projected_monthly_spending: string;
  days_remaining: number;
}

const Analytics: React.FC = () => {
  const { logout } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatusData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes, budgetRes] = await Promise.all([
        analyticsAPI.getSummary(selectedPeriod),
        analyticsAPI.getTrends(),
        analyticsAPI.getBudgetStatus()
      ]);
      
      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
      setBudgetStatus(budgetRes.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return '#28a745';
      case 'good': return '#17a2b8';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
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

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Analytics</h1>
        <div style={{ padding: '40px' }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '140px auto 0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Analytics</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '16px' }}
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            <PowerSettingsNewIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000', minHeight: '120px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#ffffff' }}>Current Balance</h3>
            <p style={{ fontSize: '28px', color: '#28a745', margin: '0', fontWeight: 'bold' }}>
              ${parseFloat(summary.summary?.current_balance || '0').toFixed(2)}
            </p>
          </div>
          
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000', minHeight: '120px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#ffffff' }}>Total Spent ({selectedPeriod})</h3>
            <p style={{ fontSize: '28px', color: '#dc3545', margin: '0', fontWeight: 'bold' }}>
              ${parseFloat(summary.summary?.total_spent || '0').toFixed(2)}
            </p>
          </div>
          
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000', minHeight: '120px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#ffffff' }}>Spending Rate</h3>
            <p style={{ fontSize: '28px', color: '#ffc107', margin: '0', fontWeight: 'bold' }}>
              {parseFloat(summary.summary?.spending_rate || '0').toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Budget Status */}
      {budgetStatus && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: '#000000'
          }}>
            <h3>Budget Health: <span style={{ color: getBudgetHealthColor(budgetStatus.budget_health) }}>
              {budgetStatus.budget_health?.toUpperCase()}
            </span></h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
              <div>
                <strong>Monthly Spent:</strong> ${parseFloat(budgetStatus.monthly_spent || '0').toFixed(2)}
              </div>
              <div>
                <strong>Avg Daily:</strong> ${parseFloat(budgetStatus.avg_daily_spending || '0').toFixed(2)}
              </div>
              <div>
                <strong>Projected Monthly:</strong> ${parseFloat(budgetStatus.projected_monthly_spending || '0').toFixed(2)}
              </div>
              <div>
                <strong>Days Remaining:</strong> {budgetStatus.days_remaining || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Spending by Category */}
        {summary?.spending_by_category && (
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000' }}>
            <h3>Spending by Category ({selectedPeriod})</h3>
            {summary.spending_by_category.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No spending data</p>
            ) : (
              <div style={{ marginTop: '15px' }}>
                {summary.spending_by_category.map((item, index: number) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '10px 0',
                    borderBottom: index < summary.spending_by_category.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <span>{item.name}</span>
                    <strong>${parseFloat(item.total || '0').toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Top Categories (All Time) */}
        {trends?.top_categories && (
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000' }}>
            <h3>Top Categories (All Time)</h3>
            {trends.top_categories.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No data available</p>
            ) : (
              <div style={{ marginTop: '15px' }}>
                {trends.top_categories.map((item, index: number) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '10px 0',
                    borderBottom: index < trends.top_categories.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <span>#{index + 1} {item.name}</span>
                    <strong>${parseFloat(item.total || '0').toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Monthly Trends */}
      {trends?.monthly_spending && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000' }}>
          <h3>Monthly Spending Trends (Last 6 Months)</h3>
          {trends.monthly_spending.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No trend data available</p>
          ) : (
            <div style={{ marginTop: '15px' }}>
              {trends.monthly_spending.map((item, index: number) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px 0',
                  borderBottom: index < trends.monthly_spending.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span>{item.period}</span>
                  <strong>${parseFloat(item.total || '0').toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Spending */}
      {summary?.daily_spending && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#000000' }}>
          <h3>Daily Spending ({selectedPeriod})</h3>
          {summary.daily_spending.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No daily spending data</p>
          ) : (
            <div style={{ marginTop: '15px', maxHeight: '300px', overflowY: 'auto' }}>
              {summary.daily_spending.map((item, index: number) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0',
                  borderBottom: index < summary.daily_spending.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span>{item.date}</span>
                  <strong>${parseFloat(item.total || '0').toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;