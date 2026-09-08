const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/budgets?month=2026-04
router.get('/', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ user: req.user._id, month });

    // Calculate spent for each budget from transactions
    const result = await Promise.all(
      budgets.map(async (b) => {
        const start = new Date(month + '-01');
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        const agg = await Transaction.aggregate([
          { $match: { user: req.user._id, type: 'expense', category: b.name, date: { $gte: start, $lt: end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return { ...b.toObject(), spent: agg[0]?.total || 0 };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/budgets
router.post('/', async (req, res) => {
  try {
    const { name, limit, month } = req.body;
    if (!name || !limit || !month)
      return res.status(400).json({ message: 'name, limit and month are required' });
    const budget = await Budget.create({ user: req.user._id, name, limit, month });
    res.status(201).json({ ...budget.toObject(), spent: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
