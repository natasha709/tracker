import express from 'express';
import Joi from 'joi';
import { db } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const expenseSchema = Joi.object({
  categoryId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(500).optional(),
  date: Joi.date().required()
});

// Get all expenses for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    
    const filters: any = {};
    if (category) filters.category = category;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const allExpenses = db.getExpensesByUserId(req.userId!, filters);
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const expenses = allExpenses.slice(startIndex, endIndex);

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create expense
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { categoryId, amount, description, date } = value;

    const expense = db.createExpense({
      user_id: req.userId,
      category_id: categoryId,
      amount,
      description,
      date: new Date(date).toISOString().split('T')[0] // Format as YYYY-MM-DD
    });

    res.status(201).json({
      id: expense.id,
      userId: expense.user_id,
      categoryId: expense.category_id,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      createdAt: expense.created_at
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { categoryId, amount, description, date } = value;
    const expenseId = req.params.id;

    const expense = db.updateExpense(expenseId, req.userId!, {
      category_id: categoryId,
      amount,
      description,
      date: new Date(date).toISOString().split('T')[0]
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      id: expense.id,
      userId: expense.user_id,
      categoryId: expense.category_id,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      createdAt: expense.created_at
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const success = db.deleteExpense(req.params.id, req.userId!);

    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;