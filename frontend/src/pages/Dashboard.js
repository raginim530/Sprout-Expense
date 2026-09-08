import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionsAPI, budgetsAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Modal from '../components/Modal';
import './Dashboard.css';

const COLORS = ['#4a6741', '#c9956c', '#8fbc8f', '#888780', '#d4a76a'];
const CATEGORIES = ['Salary', 'Bills', 'Food', 'Other', 'Transport', 'Entertainment', 'Shopping'];
const fmt = (n) => '₹' + Math.abs(n).toLocaleString('en-IN');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'expense', category: 'Food', amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
  const [saving, setSaving] = useState(false);
  const month = new Date().toISOString().slice(0, 7);

  const load = useCallback(async () => {
    const [t, b] = await Promise.all([transactionsAPI.getAll(), budgetsAPI.getAll(month)]);
    setTransactions(t.data); setBudgets(b.data);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const pieData = Object.entries(
    transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const barData = [{ name: new Date().toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), income, expense }];

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await transactionsAPI.create({ ...form, amount: parseFloat(form.amount) });
      setShowModal(false); load();
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-topbar">
        <div>
          <div className="eyebrow">HEY {user?.name?.toUpperCase()}</div>
          <h1 className="page-heading">Your <em>overview.</em></h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Transaction</button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'BALANCE', value: fmt(balance), sub: `${transactions.length} transactions`, icon: '⊡' },
          { label: 'INCOME', value: fmt(income), sub: `${transactions.filter(t => t.type === 'income').length} transactions`, icon: '↙', iconColor: '#0F6E56' },
          { label: 'EXPENSES', value: fmt(expense), sub: `${transactions.filter(t => t.type === 'expense').length} transactions`, icon: '↗', iconColor: '#993C1D' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-top">
              <span className="stat-label">{s.label}</span>
              <span className="stat-icon" style={{ color: s.iconColor }}>{s.icon}</span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="card">
          <div className="card-eyebrow">DISTRIBUTION</div>
          <div className="card-title">By Category</div>
          {pieData.length === 0
            ? <div className="empty-chart">No expense data yet</div>
            : <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
          }
        </div>
        <div className="card">
          <div className="card-eyebrow">TREND</div>
          <div className="card-title">Income vs Expense (last 6 months)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ left: 10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend iconType="square" iconSize={8} />
              <Bar dataKey="income" fill="#4a6741" radius={[3, 3, 0, 0]} name="income" />
              <Bar dataKey="expense" fill="#c9956c" radius={[3, 3, 0, 0]} name="expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom */}
      <div className="bottom-row">
        <div className="card">
          <div className="card-eyebrow">ACTIVITY</div>
          <div className="card-title">Recent Transactions</div>
          {recent.length === 0
            ? <div className="empty-chart">No transactions yet</div>
            : recent.map(t => (
              <div className="txn-row" key={t._id}>
                <div className={`txn-icon ${t.type}`}>{t.type === 'income' ? '↙' : '↗'}</div>
                <div className="txn-body">
                  <div className="txn-name">{t.category}</div>
                  <div className="txn-meta">{fmtDate(t.date)}{t.note ? ' · ' + t.note : ''}</div>
                </div>
                <div className="txn-amount">{t.type === 'expense' ? '-' : '+'}{fmt(t.amount)}</div>
              </div>
            ))
          }
        </div>
        <div className="card">
          <div className="card-eyebrow">BUDGETS</div>
          <div className="card-title">This Month</div>
          {budgets.length === 0
            ? <div className="empty-chart">No budgets set</div>
            : budgets.map(b => {
              const pct = b.limit ? Math.min(100, Math.round(b.spent / b.limit * 100)) : 0;
              return (
                <div className="budget-mini" key={b._id}>
                  <div className="budget-mini-top">
                    <span>{b.name}</span>
                    <span>{fmt(b.spent)} / {fmt(b.limit)}</span>
                  </div>
                  <div className="budget-bar-bg"><div className="budget-bar-fill" style={{ width: pct + '%' }} /></div>
                </div>
              );
            })
          }
        </div>
      </div>

      {showModal && (
        <Modal title="Add Transaction" onClose={() => setShowModal(false)}>
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
              <input className="form-input" type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="e.g. grocery run" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Adding...' : 'Add'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
