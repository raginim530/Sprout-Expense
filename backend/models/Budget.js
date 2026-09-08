const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 0 },
    month: { type: String, required: true }, // format: "2026-04"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);
