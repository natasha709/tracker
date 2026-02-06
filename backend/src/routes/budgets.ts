import express from 'express';
import Joi from 'joi';
import { db } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const budgetSchema = Joi.object({
  categoryId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2030).required()
});

// Get all budgets for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { month, year } = req.query;
    
    const data = db.read();
    let budgets = data.budgets.filter(budget => budget.user_id === req.userId);
    
    if (month && year) {
      budgets = budgets.filter(budget => 
        budget.month === Number(month) && budget.year === Number(year)
      );
    }

    // Add category info and transform field names
    budgets = budgets.map(budget => {
      const category = data.categories.find(cat => cat.id === budget.category_id);
      return {
        id: budget.id,
        userId: budget.user_id,
        categoryId: budget.category_id,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
        createdAt: budget.created_at,
        category
      };
    });

    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create budget
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { categoryId, amount, month, year } = value;

    const data = db.read();
    
    // Check if budget already exists for this category/month/year
    const existingBudget = data.budgets.find(budget => 
      budget.user_id === req.userId &&
      budget.category_id === categoryId &&
      budget.month === month &&
      budget.year === year
    );

    if (existingBudget) {
      return res.status(400).json({ error: 'Budget already exists for this category and month' });
    }

    const budget = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      user_id: req.userId,
      category_id: categoryId,
      amount,
      month,
      year,
      created_at: new Date().toISOString()
    };

    data.budgets.push(budget);
    db.write(data);

    // Transform field names for response
    const responsebudget = {
      id: budget.id,
      userId: budget.user_id,
      categoryId: budget.category_id,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      createdAt: budget.created_at
    };

    res.status(201).json(responsebudget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update budget
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { categoryId, amount, month, year } = value;
    const budgetId = req.params.id;

    const data = db.read();
    const budgetIndex = data.budgets.findIndex(budget => 
      budget.id === budgetId && budget.user_id === req.userId
    );

    if (budgetIndex === -1) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    data.budgets[budgetIndex] = {
      ...data.budgets[budgetIndex],
      category_id: categoryId,
      amount,
      month,
      year
    };

    db.write(data);
    
    // Transform field names for response
    const updatedBudget = data.budgets[budgetIndex];
    const responseBudget = {
      id: updatedBudget.id,
      userId: updatedBudget.user_id,
      categoryId: updatedBudget.category_id,
      amount: updatedBudget.amount,
      month: updatedBudget.month,
      year: updatedBudget.year,
      createdAt: updatedBudget.created_at
    };
    
    res.json(responseBudget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete budget
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = db.read();
    const budgetIndex = data.budgets.findIndex(budget => 
      budget.id === req.params.id && budget.user_id === req.userId
    );

    if (budgetIndex === -1) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    data.budgets.splice(budgetIndex, 1);
    db.write(data);

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;