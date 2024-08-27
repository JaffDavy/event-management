import express from 'express';
import pool from '../config/config.js'; 

const router = express.Router();

// Route to create a new event
router.post('/events', async (req, res, next) => {
  try {
    const { title, summary, date, location, category_id } = req.body;

    if (!title || !summary || !date || !location || !category_id) {
      return res.status(400).json({ error: 'Event title, summary, date, location, and category_id are required' });
    }

    const result = await pool.query(
      'INSERT INTO Events (EventTitle, EventSummary, EventDate, EventLocation, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, summary, date, location, category_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in /events POST:', error.message);
    next(error);
  }
});

// Route to get all events
router.get('/events', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM Events');
    res.json(result.rows);
  } catch (error) {
    console.error('Error in /events GET:', error.message);
    next(error);
  }
});

// Route to update an event
router.put('/events/:id', async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const { title, summary, date, location, category_id } = req.body;

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!title || !summary || !date || !location || !category_id) {
      return res.status(400).json({ error: 'Event title, summary, date, location, and category_id are required' });
    }

    if (!await validateCategory(category_id)) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    const result = await pool.query(
      'UPDATE Events SET EventTitle = $1, EventSummary = $2, EventDate = $3, EventLocation = $4, category_id = $5 WHERE event_id = $6 RETURNING *',
      [title, summary, date, location, category_id, eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in /events/:id PUT:', error.message);
    next(error);
  }
});

// Route to delete an event
router.delete('/events/:id', async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const result = await pool.query('DELETE FROM Events WHERE event_id = $1 RETURNING *', [eventId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in /events/:id DELETE:', error.message);
    next(error);
  }
});

export default router;
