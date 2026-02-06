import express from 'express';
import { db } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get expense analytics
router.get('/expenses', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filters: any = {};
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    
    const expenses = db.getExpensesByUserId(req.userId!, filters);
    
    // Total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Category breakdown
    const categoryMap = new Map();
    const categories = db.getCategories();
    
    // Initialize all categories with 0
    categories.forEach(category => {
      categoryMap.set(category.id, {
        category,
        amount: 0,
        percentage: 0
      });
    });
    
    // Add actual expenses
    expenses.forEach(expense => {
      if (categoryMap.has(expense.category_id)) {
        const current = categoryMap.get(expense.category_id);
        current.amount += expense.amount;
      }
    });
    
    // Calculate percentages and convert to array
    const categoryBreakdown = Array.from(categoryMap.values()).map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    // Monthly trend (last 6 months)
    const monthlyTrend: any[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = date.toISOString().split('T')[0];
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const monthExpenses = db.getExpensesByUserId(req.userId!, {
        startDate: monthStart,
        endDate: monthEnd
      });
      
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyTrend.push({
        month: date.toISOString().substring(0, 7), // YYYY-MM format
        amount: monthTotal
      });
    }

    res.json({
      totalExpenses,
      categoryBreakdown,
      monthlyTrend
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;