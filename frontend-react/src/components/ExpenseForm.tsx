import React, { useState, useEffect } from 'react';
import { categoryAPI, expenseAPI } from '../services/api.ts';
import type { Category } from '../types/index.ts';

interface ExpenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    notes: '',
    category_id: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await expenseAPI.create({
        amount: parseFloat(form.amount),
        description: form.description,
        notes: form.notes || undefined,
        category_id: parseInt(form.category_id),
        expense_date: form.expense_date
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Error creating expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#000000'
    }}>
      <h3>Add New Expense</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category *</label>
          <select
            value={form.category_id}
            onChange={(e) => handleChange('category_id', e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description *</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '60px' }}
          placeholder="Optional notes..."
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date *</label>
        <input
          type="date"
          value={form.expense_date}
          onChange={(e) => handleChange('expense_date', e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Add Expense'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;