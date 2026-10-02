const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/monthly-data.json');

// Get all months
router.get('/months', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const months = data.months.map(month => ({
      id: month.id,
      monthName: month.monthName,
      date: month.date
    }));
    res.json(months);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific month data
router.get('/month/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const month = data.months.find(m => m.id === req.params.id);
    
    if (!month) {
      return res.status(404).json({ error: 'Month not found' });
    }
    
    res.json(month);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest 3 months
router.get('/latest', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const latest = data.months.slice(0, 3);
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
