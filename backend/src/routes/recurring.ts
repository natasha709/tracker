import express from 'express';
import Joi from 'joi';
import { db } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const recurringExpenseSchema = Joi.object({
  categoryId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().required(),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().optional(),
  isActive: Joi.boolean().default(true)
});

// Get all recurring expenses for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = db.read();
    let recurringExpenses = data.recurringExpenses?.filter(expense => expense.user_id === req.userId) || [];
    
    // Transform field names and add category info
    recurringExpenses = recurringExpenses.map(expense => {
      const category = data.categories.find(cat => cat.id === expense.category_id);
      return {
        id: expense.id,
        userId: expense.user_id,
        categoryId: expense.category_id,
        amount: expense.amount,
        description: expense.description,
        frequency: expense.frequency,
        startDate: expense.start_date,
        endDate: expense.end_date,
        isActive: expense.is_active,
        createdAt: expense.created_at,
        category
      };
    });

    res.json(recurringExpenses);
  } catch (error) {
    console.error('Get recurring expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create recurring expense
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = recurringExpenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { categoryId, amount, description, frequency, startDate, endDate, isActive } = value;

    const data = db.read();
    if (!data.recurringExpenses) {
      data.recurringExpenses = [];
    }

    const recurringExpense = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      user_id: req.userId,
      category_id: categoryId,
      amount,
      description,
      frequency,
      start_date: startDate,
      end_date: endDate || null,
      is_active: isActive,
      created_at: new Date().toISOString()
    };

    data.recurringExpenses.push(recurringExpense);
    db.write(data);

    // Transform field names for response
    const responseExpense = {
      id: recurringExpense.id,
      userId: recurringExpense.user_id,
      categoryId: recurringExpense.category_id,
      amount: recurringExpense.amount,
      description: recurringExpense.description,
      frequency: recurringExpense.frequency,
      startDate: recurringExpense.start_date,
      endDate: recurringExpense.end_date,
      isActive: recurringExpense.is_active,
      createdAt: recurringExpense.created_at
    };

    res.status(201).json(responseExpense);
  } catch (error) {
    console.error('Create recurring expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update recurring expense
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { error, value } = recurringExpenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { categoryId, amount, description, frequency, startDate, endDate, isActive } = value;
    const expenseId = req.params.id;

    const data = db.read();
    if (!data.recurringExpenses) {
      data.recurringExpenses = [];
    }

    const expenseIndex = data.recurringExpenses.findIndex(expense => 
      expense.id === expenseId && expense.user_id === req.userId
    );

    if (expenseIndex === -1) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }

    data.recurringExpenses[expenseIndex] = {
      ...data.recurringExpenses[expenseIndex],
      category_id: categoryId,
      amount,
      description,
      frequency,
      start_date: startDate,
      end_date: endDate || null,
      is_active: isActive
    };

    db.write(data);
    
    const updatedExpense = data.recurringExpenses[expenseIndex];
    const responseExpense = {
      id: updatedExpense.id,
      userId: updatedExpense.user_id,
      categoryId: updatedExpense.category_id,
      amount: updatedExpense.amount,
      description: updatedExpense.description,
      frequency: updatedExpense.frequency,
      startDate: updatedExpense.start_date,
      endDate: updatedExpense.end_date,
      isActive: updatedExpense.is_active,
      createdAt: updatedExpense.created_at
    };
    
    res.json(responseExpense);
  } catch (error) {
    console.error('Update recurring expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete recurring expense
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = db.read();
    if (!data.recurringExpenses) {
      data.recurringExpenses = [];
    }

    const expenseIndex = data.recurringExpenses.findIndex(expense => 
      expense.id === req.params.id && expense.user_id === req.userId
    );

    if (expenseIndex === -1) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }

    data.recurringExpenses.splice(expenseIndex, 1);
    db.write(data);

    res.json({ message: 'Recurring expense deleted successfully' });
  } catch (error) {
    console.error('Delete recurring expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate expenses from recurring templates
router.post('/generate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = db.read();
    if (!data.recurringExpenses) {
      return res.json({ generated: 0 });
    }

    const activeRecurring = data.recurringExpenses.filter(expense => 
      expense.user_id === req.userId && expense.is_active
    );

    console.log(`Found ${activeRecurring.length} active recurring expenses for user ${req.userId}`);

    let generatedCount = 0;
    const today = new Date();

    for (const recurring of activeRecurring) {
      console.log(`Processing recurring expense: ${recurring.description}, frequency: ${recurring.frequency}`);
      
      const startDate = new Date(recurring.start_date);
      const endDate = recurring.end_date ? new Date(recurring.end_date) : null;

      // Check if we should generate an expense for today
      if (shouldGenerateExpense(recurring, today, startDate, endDate)) {
        console.log(`Generating expense for: ${recurring.description}`);
        
        // Check if expense already exists for today to avoid duplicates
        const existingExpense = data.expenses.find(expense => 
          expense.user_id === req.userId &&
          expense.recurring_id === recurring.id &&
          expense.date === today.toISOString().split('T')[0]
        );

        if (!existingExpense) {
          const expense = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            user_id: req.userId,
            category_id: recurring.category_id,
            amount: recurring.amount,
            description: `${recurring.description} (Auto-generated)`,
            date: today.toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            recurring_id: recurring.id
          };

          data.expenses.push(expense);
          generatedCount++;
        } else {
          console.log(`Expense already exists for today: ${recurring.description}`);
        }
      }
    }

    if (generatedCount > 0) {
      db.write(data);
      console.log(`Generated ${generatedCount} recurring expenses`);
    }

    res.json({ generated: generatedCount });
  } catch (error) {
    console.error('Generate recurring expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to check recurring expenses without generating
router.get('/test-generation', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = db.read();
    if (!data.recurringExpenses) {
      return res.json({ message: 'No recurring expenses found' });
    }

    const activeRecurring = data.recurringExpenses.filter(expense => 
      expense.user_id === req.userId && expense.is_active
    );

    const today = new Date();
    const testResults = activeRecurring.map(recurring => {
      const startDate = new Date(recurring.start_date);
      const endDate = recurring.end_date ? new Date(recurring.end_date) : null;
      const shouldGenerate = shouldGenerateExpense(recurring, today, startDate, endDate);
      
      return {
        description: recurring.description,
        frequency: recurring.frequency,
        startDate: recurring.start_date,
        endDate: recurring.end_date,
        shouldGenerate,
        today: today.toISOString().split('T')[0]
      };
    });

    res.json({ 
      activeRecurring: activeRecurring.length,
      today: today.toISOString().split('T')[0],
      testResults 
    });
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to manually trigger generation with detailed logging
router.post('/force-generate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = db.read();
    if (!data.recurringExpenses) {
      return res.json({ message: 'No recurring expenses found', generated: 0 });
    }

    const activeRecurring = data.recurringExpenses.filter(expense => 
      expense.user_id === req.userId && expense.is_active
    );

    console.log(`=== FORCE GENERATE DEBUG ===`);
    console.log(`Found ${activeRecurring.length} active recurring expenses for user ${req.userId}`);
    console.log(`Today: ${new Date().toISOString()}`);

    let generatedCount = 0;
    const today = new Date();
    const debugInfo = [];

    for (const recurring of activeRecurring) {
      console.log(`\n--- Processing: ${recurring.description} ---`);
      console.log(`Frequency: ${recurring.frequency}`);
      console.log(`Start Date: ${recurring.start_date}`);
      console.log(`End Date: ${recurring.end_date}`);
      
      const startDate = new Date(recurring.start_date);
      const endDate = recurring.end_date ? new Date(recurring.end_date) : null;

      console.log(`Parsed Start Date: ${startDate.toISOString()}`);
      console.log(`Parsed End Date: ${endDate?.toISOString()}`);

      // Force generation for testing (ignore date logic)
      const expense = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        user_id: req.userId,
        category_id: recurring.category_id,
        amount: recurring.amount,
        description: `${recurring.description} (Force Generated)`,
        date: today.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        recurring_id: recurring.id
      };

      data.expenses.push(expense);
      generatedCount++;

      debugInfo.push({
        description: recurring.description,
        frequency: recurring.frequency,
        startDate: recurring.start_date,
        endDate: recurring.end_date,
        generated: true
      });

      console.log(`✅ Generated expense: ${expense.description}`);
    }

    if (generatedCount > 0) {
      db.write(data);
      console.log(`=== Generated ${generatedCount} expenses ===`);
    }

    res.json({ 
      generated: generatedCount,
      debugInfo,
      message: `Force generated ${generatedCount} expenses for testing`
    });
  } catch (error) {
    console.error('Force generate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function shouldGenerateExpense(recurring: any, today: Date, startDate: Date, endDate: Date | null): boolean {
  // Check if today is within the active period
  if (today < startDate || (endDate && today > endDate)) {
    console.log(`Date out of range for ${recurring.description}: today=${today.toDateString()}, start=${startDate.toDateString()}, end=${endDate?.toDateString()}`);
    return false;
  }

  const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (recurring.frequency) {
    case 'daily':
      // Generate every day
      return true;
      
    case 'weekly':
      // Generate every 7 days from start date
      return daysDiff % 7 === 0;
      
    case 'monthly':
      // Generate on the same day of month as start date, or last day of month if start day doesn't exist
      const todayDay = today.getDate();
      const startDay = startDate.getDate();
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      
      // If start day is greater than current month's last day, use last day of month
      const targetDay = Math.min(startDay, lastDayOfMonth);
      return todayDay === targetDay;
      
    case 'yearly':
      // Generate on the same month and day each year
      return today.getMonth() === startDate.getMonth() && today.getDate() === startDate.getDate();
      
    default:
      console.log(`Unknown frequency: ${recurring.frequency}`);
      return false;
  }
}

export default router;