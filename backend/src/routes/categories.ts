import express from 'express';
import { db } from '../database/connection';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = db.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;