export interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  is_predefined: boolean;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  notes?: string;
  expense_date: string;
  category: Category;
}

export interface AuthResponse {
  user: User;
  token: string;
}