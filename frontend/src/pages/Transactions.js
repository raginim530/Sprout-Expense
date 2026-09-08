import React, { useEffect, useState, useCallback } from 'react';
import { transactionsAPI } from '../api';
import Modal from '../components/Modal';
import './Transactions.css';

const CATEGORIES = ['Salary', 'Bills', 'Food', 'Other', 'Transport', 'Entertainment', 'Shopping'];
const fmt = (n) => '₹' + Math.abs(n).toLocaleString('en-IN');
const fmtFull = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const defaultForm = { type: 'expense', category: 'Food', amount: '', date: new Date().toISOString().slice(0, 10), note: '' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await transactionsAPI.getAll();
    setTransactions(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = transactions
    .filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCat !== 'all' && t.category !== filterCat) return false;
      if (filterFrom && new Date(t.date) < new Date(filterFrom)) return false;
      if (filterTo && new Date(t.date) > new Date(filterTo)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ type: t.type, category: t.category, amount: t.amount, date: t.date?.slice(0, 10), note: t.note || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await transactionsAPI.update(editing._id, { ...form, amount: parseFloat(form.amount) });
      else await transactionsAPI.create({ ...form, amount: parseFloat(form.amount) });
      setShowModal(false); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await transactionsAPI.delete(id); load();
  };

  const reset = () => { setFilterType('all'); setFilterCat('all'); setFilterFrom(''); setFilterTo(''); };
  const allCats = [...new Set(transactions.map(t => t.category))];

  return (
    <div>
      <div className="page-topbar">
        <div>
          <div className="eyebrow">ALL ACTIVITY</div>
          <h1 className="page-heading" style={{ fontSize: 28 }}>Transactions</h1>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Transaction</button>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-label">⊟ FILTERS</div>
        <div className="filter-row">
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">All categories</option>
            {allCats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" className="filter-date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          <input type="date" className="filter-date" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          <button className="reset-btn" onClick={reset}>Reset</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-head">
          <div>DATE</div><div>CATEGORY</div><div>NOTE</div><div style={{ textAlign: 'right' }}>AMOUNT</div><div></div>
        </div>
        {filtered.length === 0
          ? <div className="table-empty">No transactions found</div>
          : filtered.map(t => (
            <div className="table-row" key={t._id}>
              <div className="cell">{fmtFull(t.date)}</div>
              <div className="cell">
                <span style={{ color: t.type === 'income' ? '#0f6e56' : '#993c1d', marginRight: 5 }}>
                  {t.type === 'income' ? '↙' : '↗'}
                </span>{t.category}
              </div>
              <div className="cell muted">{t.note || '—'}</div>
              <div className="cell" style={{ textAlign: 'right', fontWeight: 500 }}>
                {t.type === 'expense' ? '-' : '+'}{fmt(t.amount)}
              </div>
              <div className="cell actions">
                <button className="icon-btn" onClick={() => openEdit(t)} title="Edit">✏</button>
                <button className="icon-btn del" onClick={() => handleDelete(t._id)} title="Delete">🗑</button>
              </div>
            </div>
          ))
        }
      </div>
      <div className="txn-count">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</div>

      {showModal && (
        <Modal title={editing ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" min="1" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-input" type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="e.g. rent" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
