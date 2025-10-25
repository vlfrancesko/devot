import axios from 'axios';
import type { AuthResponse, Category, Expense } from '../types/index.ts';

interface ExpenseFilters {
  category_id?: number;
  min_amount?: number;
  max_amount?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

interface ExpenseUpdateData {
  amount?: number;
  description?: string;
  notes?: string;
  category_id?: number;
  expense_date?: string;
}

const API_BASE_URL = 'http://127.0.0.1/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/login', data),
  logout: () => api.post('/logout'),
};

export const categoryAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (data: { name: string; description?: string; color?: string }) =>
    api.post<Category>('/categories', data),
  update: (id: number, data: { name: string; description?: string; color?: string }) =>
    api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const expenseAPI = {
  getAll: (params?: ExpenseFilters) => api.get<{ data: Expense[] }>('/expenses', { params }),
  create: (data: { amount: number; description: string; notes?: string; category_id: number; expense_date: string }) =>
    api.post<Expense>('/expenses', data),
  update: (id: number, data: ExpenseUpdateData) => api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

export const analyticsAPI = {
  getSummary: (period: string = 'month') => api.get(`/analytics/summary?period=${period}`),
  getTrends: () => api.get('/analytics/trends'),
  getBudgetStatus: () => api.get('/analytics/budget-status'),
};