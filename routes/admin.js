const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/monthly-data.json');

// Admin password (měníte v .env)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware pro ověření hesla
const verifyAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Update month data
router.post('/update/:monthId', verifyAdmin, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const monthIndex = data.months.findIndex(m => m.id === req.params.monthId);
    
    if (monthIndex === -1) {
      return res.status(404).json({ error: 'Month not found' });
    }
    
    // Aktualizace dat
    data.months[monthIndex] = {
      ...data.months[monthIndex],
      ...req.body
    };
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ message: 'Data updated successfully', data: data.months[monthIndex] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new month
router.post('/add-month', verifyAdmin, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newMonth = req.body;
    
    data.months.unshift(newMonth);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    res.json({ message: 'Month added successfully', data: newMonth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
