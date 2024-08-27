import express from 'express';
import pool from '../config/config.js'; 

const router = express.Router();

// Utility function to validate if a category exists
const validateCategory = async (category_id) => {
  try {
    const category = await pool.query('SELECT id FROM Categories WHERE id = $1', [category_id]);
    return category.rows.length > 0;
  } catch (error) {
    console.error('Error validating category:', error.message);
    throw error;
  }
};

// Route to get events by category name
router.get('/category/:categoryName', async (req, res, next) => {
  try {
    const { categoryName } = req.params;

    // Query to select events by category name
    const result = await pool.query(
      `select * from categories`, 
      [categoryName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No events found for this category' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error in /category/:categoryName GET:', error.message);
    next(error);
  }
});

// Route to get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Categories');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
