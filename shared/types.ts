export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  category?: Category;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  category?: Category;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  categoryBreakdown: Array<{
    category: Category;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
}