const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const { type, category, from, to } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { type, category, amount, date, note } = req.body;
    if (!type || !category || !amount || !date)
      return res.status(400).json({ message: 'type, category, amount and date are required' });
    const txn = await Transaction.create({ user: req.user._id, type, category, amount, date, note });
    res.status(201).json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    const { type, category, amount, date, note } = req.body;
    if (type) txn.type = type;
    if (category) txn.category = category;
    if (amount) txn.amount = amount;
    if (date) txn.date = date;
    if (note !== undefined) txn.note = note;
    await txn.save();
    res.json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
