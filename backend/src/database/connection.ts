import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Simple JSON database
const dbPath = path.join(__dirname, '../../database.json');

interface Database {
  users: any[];
  categories: any[];
  expenses: any[];
  budgets: any[];
  recurringExpenses?: any[];
}

// Initialize database
const initDatabase = (): Database => {
  const defaultDb: Database = {
    users: [],
    categories: [
      { id: uuidv4(), name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
      { id: uuidv4(), name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
      { id: uuidv4(), name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
      { id: uuidv4(), name: 'Entertainment', color: '#96CEB4', icon: '🎬' },
      { id: uuidv4(), name: 'Bills & Utilities', color: '#FFEAA7', icon: '💡' },
      { id: uuidv4(), name: 'Healthcare', color: '#DDA0DD', icon: '🏥' },
      { id: uuidv4(), name: 'Education', color: '#98D8C8', icon: '📚' },
      { id: uuidv4(), name: 'Travel', color: '#F7DC6F', icon: '✈️' },
      { id: uuidv4(), name: 'Other', color: '#BDC3C7', icon: '📦' }
    ],
    expenses: [],
    budgets: [],
    recurringExpenses: []
  };

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
    console.log('✅ JSON database initialized successfully');
  } else {
    console.log('✅ JSON database loaded successfully');
  }

  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

// Database operations
export const db = {
  read: (): Database => {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  },

  write: (data: Database): void => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  },

  // User operations
  findUserByEmail: (email: string) => {
    const data = db.read();
    return data.users.find(user => user.email === email);
  },

  findUserById: (id: string) => {
    const data = db.read();
    return data.users.find(user => user.id === id);
  },

  createUser: (userData: any) => {
    const data = db.read();
    const user = {
      id: uuidv4(),
      ...userData,
      created_at: new Date().toISOString()
    };
    data.users.push(user);
    db.write(data);
    return user;
  },

  // Category operations
  getCategories: () => {
    const data = db.read();
    return data.categories;
  },

  // Expense operations
  getExpensesByUserId: (userId: string, filters: any = {}) => {
    const data = db.read();
    let expenses = data.expenses.filter(expense => expense.user_id === userId);
    
    if (filters.category) {
      expenses = expenses.filter(expense => expense.category_id === filters.category);
    }
    
    if (filters.startDate) {
      expenses = expenses.filter(expense => expense.date >= filters.startDate);
    }
    
    if (filters.endDate) {
      expenses = expenses.filter(expense => expense.date <= filters.endDate);
    }

    // Add category info
    expenses = expenses.map(expense => {
      const category = data.categories.find(cat => cat.id === expense.category_id);
      return { ...expense, category };
    });

    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createExpense: (expenseData: any) => {
    const data = db.read();
    const expense = {
      id: uuidv4(),
      ...expenseData,
      created_at: new Date().toISOString()
    };
    data.expenses.push(expense);
    db.write(data);
    return expense;
  },

  updateExpense: (id: string, userId: string, expenseData: any) => {
    const data = db.read();
    const index = data.expenses.findIndex(expense => expense.id === id && expense.user_id === userId);
    if (index === -1) return null;
    
    data.expenses[index] = { ...data.expenses[index], ...expenseData };
    db.write(data);
    return data.expenses[index];
  },

  deleteExpense: (id: string, userId: string) => {
    const data = db.read();
    const index = data.expenses.findIndex(expense => expense.id === id && expense.user_id === userId);
    if (index === -1) return false;
    
    data.expenses.splice(index, 1);
    db.write(data);
    return true;
  }
};

// Initialize database on startup
initDatabase();

export default db;