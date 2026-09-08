import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">S</div>
          <div>
            <div className="auth-logo-name">Sprout</div>
            <div className="auth-logo-sub">Personal Finance</div>
          </div>
        </div>

        <h2 className="auth-heading">Create account</h2>
        <p className="auth-subtext">Start tracking your finances today</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Full name</label>
            <input
              type="text" required placeholder="Your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="auth-form-group">
            <label>Email address</label>
            <input
              type="email" required placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="auth-form-group">
            <label>Password <span style={{color:'#888780',fontWeight:400}}>(min 6 chars)</span></label>
            <input
              type="password" required placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <div className="auth-divider">
          <span className="line" /><span className="text">JWT secured</span><span className="line" />
        </div>
        <p className="auth-note">Your data is stored per-account with JWT authentication</p>
      </div>
    </div>
  );
}
