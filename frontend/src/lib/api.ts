import axios from 'axios';
import { AuthResponse, User, Expense, Category, ExpenseStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (email: string, name: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/register', { email, name, password }).then(res => res.data),
};

export const expenseApi = {
  getExpenses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]> =>
    api.get('/expenses', { params }).then(res => res.data),
  
  createExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>): Promise<Expense> =>
    api.post('/expenses', expense).then(res => res.data),
  
  updateExpense: (id: string, expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>): Promise<Expense> =>
    api.put(`/expenses/${id}`, expense).then(res => res.data),
  
  deleteExpense: (id: string): Promise<void> =>
    api.delete(`/expenses/${id}`).then(res => res.data),
};

export const categoryApi = {
  getCategories: (): Promise<Category[]> =>
    api.get('/categories').then(res => res.data),
};

export const analyticsApi = {
  getExpenseStats: (params?: { startDate?: string; endDate?: string }): Promise<ExpenseStats> =>
    api.get('/analytics/expenses', { params }).then(res => res.data),
};

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  category?: Category;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  category?: Category;
}

export const budgetApi = {
  getBudgets: (params?: { month?: number; year?: number }): Promise<Budget[]> =>
    api.get('/budgets', { params }).then(res => res.data),
  
  createBudget: (budget: { categoryId: string; amount: number; month: number; year: number }): Promise<Budget> =>
    api.post('/budgets', budget).then(res => res.data),
  
  updateBudget: (id: string, budget: { categoryId: string; amount: number; month: number; year: number }): Promise<Budget> =>
    api.put(`/budgets/${id}`, budget).then(res => res.data),
  
  deleteBudget: (id: string): Promise<void> =>
    api.delete(`/budgets/${id}`).then(res => res.data),
};

export const recurringApi = {
  getRecurringExpenses: (): Promise<RecurringExpense[]> =>
    api.get('/recurring').then(res => res.data),
  
  createRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'userId' | 'createdAt' | 'category'>): Promise<RecurringExpense> =>
    api.post('/recurring', expense).then(res => res.data),
  
  updateRecurringExpense: (id: string, expense: Omit<RecurringExpense, 'id' | 'userId' | 'createdAt' | 'category'>): Promise<RecurringExpense> =>
    api.put(`/recurring/${id}`, expense).then(res => res.data),
  
  deleteRecurringExpense: (id: string): Promise<void> =>
    api.delete(`/recurring/${id}`).then(res => res.data),
  
  generateRecurringExpenses: (): Promise<{ generated: number }> =>
    api.post('/recurring/generate').then(res => res.data),
  
  forceGenerateRecurringExpenses: (): Promise<{ generated: number; debugInfo: any[]; message: string }> =>
    api.post('/recurring/force-generate').then(res => res.data),
  
  testGeneration: (): Promise<{ activeRecurring: number; today: string; testResults: any[] }> =>
    api.get('/recurring/test-generation').then(res => res.data),
};

export default api;