import React, { useEffect, useState, useCallback } from 'react';
import { budgetsAPI } from '../api';
import Modal from '../components/Modal';
import './Budgets.css';

const fmt = (n) => '₹' + Math.abs(n).toLocaleString('en-IN');

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', limit: '' });
  const [saving, setSaving] = useState(false);
  const month = new Date().toISOString().slice(0, 7);

  const load = useCallback(async () => {
    const res = await budgetsAPI.getAll(month);
    setBudgets(res.data);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent  = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await budgetsAPI.create({ name: form.name, limit: parseFloat(form.limit), month });
      setShowModal(false); setForm({ name: '', limit: '' }); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await budgetsAPI.delete(id); load();
  };

  return (
    <div>
      <div className="page-topbar">
        <div>
          <div className="eyebrow">STAY ON TRACK</div>
          <h1 className="page-heading" style={{ fontSize: 28 }}>Monthly Budgets</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Budget</button>
      </div>

      <div className="budget-stats-row">
        <div className="stat-card"><div className="stat-label">TOTAL BUDGET</div><div className="stat-value">{fmt(totalBudget)}</div></div>
        <div className="stat-card"><div className="stat-label">SPENT THIS MONTH</div><div className="stat-value">{fmt(totalSpent)}</div></div>
        <div className="stat-card"><div className="stat-label">REMAINING</div><div className="stat-value">{fmt(totalBudget - totalSpent)}</div></div>
      </div>

      <div className="budget-grid">
        {budgets.length === 0
          ? <div className="empty-state">No budgets yet. Click "+ Add Budget" to create one.</div>
          : budgets.map(b => {
            const pct = b.limit ? Math.min(100, Math.round((b.spent || 0) / b.limit * 100)) : 0;
            const over = pct >= 90;
            return (
              <div className="budget-card" key={b._id}>
                <div className="budget-card-top">
                  <div className="budget-card-name">{b.name}</div>
                  <button className="del-icon" onClick={() => handleDelete(b._id)}>🗑</button>
                </div>
                <div className="budget-frac">{fmt(b.spent || 0)} of {fmt(b.limit)}</div>
                <div className="budget-bar-bg">
                  <div className="budget-bar-fill" style={{ width: pct + '%', background: over ? '#c9956c' : '#4a6741' }} />
                </div>
                <div className="budget-pct">{pct}% used</div>
              </div>
            );
          })
        }
      </div>

      {showModal && (
        <Modal title="Add Budget" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Category name</label>
              <input className="form-input" required placeholder="e.g. Food" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Monthly limit (₹)</label>
              <input className="form-input" type="number" min="1" required placeholder="0" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Adding...' : 'Add Budget'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
