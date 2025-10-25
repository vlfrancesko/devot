import React, { useState, useEffect, useCallback } from 'react';
import { categoryAPI, expenseAPI, authAPI } from '../services/api.ts';
import ExpenseForm from '../components/ExpenseForm.tsx';
import type { Category, Expense } from '../types/index.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const Expenses: React.FC = () => {
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    category_id: '',
    min_amount: '',
    max_amount: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
      );
      const response = await expenseAPI.getAll(params);
      setExpenses(response.data?.data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, [loadExpenses]);

  const handleFilterInputChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-apply filters on change
    const params = Object.fromEntries(
      Object.entries(newFilters).filter(([, val]) => val !== '')
    );
    
    setLoading(true);
    expenseAPI.getAll(params)
      .then(response => setExpenses(response.data?.data || []))
      .catch(error => {
        console.error('Error loading expenses:', error);
        setExpenses([]);
      })
      .finally(() => setLoading(false));
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      min_amount: '',
      max_amount: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    setTimeout(loadExpenses, 100);
  };

  const deleteExpense = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadExpenses();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Expenses</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '8px 12px',
              backgroundColor: showForm ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {showForm ? <CloseIcon fontSize="small" /> : <AddIcon fontSize="small" />}
          </button>
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

      {showForm ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
          {/* Add Expense Form */}
          <div>
            <ExpenseForm 
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
          
          {/* Expenses List */}
          <div>
            <h3 style={{ margin: '0 0 15px 0' }}>Recent Expenses ({expenses.length})</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No expenses found
              </div>
            ) : (
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                {expenses.map(expense => (
                  <div 
                    key={expense.id} 
                    style={{ 
                      padding: '15px', 
                      borderBottom: '1px solid #eee', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{expense.description}</strong>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        {expense.category?.name || 'Unknown'} • {new Date(expense.expense_date).toLocaleDateString()}
                      </p>
                      {expense.notes && (
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#888' }}>
                          {expense.notes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontSize: '18px', color: '#dc3545', fontWeight: 'bold' }}>
                        -${parseFloat(expense.amount?.toString() || '0').toFixed(2)}
                      </div>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            marginBottom: '20px',
            backgroundColor: '#000000'
          }}>
            <h3>Filters</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterInputChange('category_id', e.target.value)}
                style={{ padding: '8px' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Min Amount"
                value={filters.min_amount}
                onChange={(e) => handleFilterInputChange('min_amount', e.target.value)}
                style={{ padding: '8px' }}
              />

              <input
                type="number"
                placeholder="Max Amount"
                value={filters.max_amount}
                onChange={(e) => handleFilterInputChange('max_amount', e.target.value)}
                style={{ padding: '8px' }}
              />

              <input
                type="date"
                placeholder="From Date"
                value={filters.date_from}
                onChange={(e) => handleFilterInputChange('date_from', e.target.value)}
                style={{ padding: '8px' }}
              />

              <input
                type="date"
                placeholder="To Date"
                value={filters.date_to}
                onChange={(e) => handleFilterInputChange('date_to', e.target.value)}
                style={{ padding: '8px' }}
              />

              <input
                type="text"
                placeholder="Search description..."
                value={filters.search}
                onChange={(e) => handleFilterInputChange('search', e.target.value)}
                style={{ padding: '8px' }}
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={clearFilters}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px'
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div>
            <h3>Results ({expenses.length} expenses)</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No expenses found matching your criteria
              </div>
            ) : (
              <div style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
                {expenses.map(expense => (
                  <div 
                    key={expense.id} 
                    style={{ 
                      padding: '15px', 
                      borderBottom: '1px solid #eee', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{expense.description}</strong>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        {expense.category?.name || 'Unknown'} • {new Date(expense.expense_date).toLocaleDateString()}
                      </p>
                      {expense.notes && (
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#888' }}>
                          {expense.notes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontSize: '18px', color: '#dc3545', fontWeight: 'bold' }}>
                        -${parseFloat(expense.amount?.toString() || '0').toFixed(2)}
                      </div>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Expenses;