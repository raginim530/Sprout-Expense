import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => { logout(); navigate('/login'); };

  const initial = user?.name?.[0]?.toUpperCase() || '?';
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const tokenPreview = token ? token.substring(0, 50) + '...' : '';

  return (
    <div>
      <div className="eyebrow">ACCOUNT</div>
      <h1 className="page-heading" style={{ fontSize: 28, marginBottom: 22 }}>Settings</h1>

      {/* Profile card */}
      <div className="settings-card">
        <div className="profile-top">
          <div className="profile-avatar">{initial}</div>
          <div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
          </div>
        </div>
        <div className="profile-meta">
          <div className="meta-item">
            <div className="meta-label">✦ NAME</div>
            <div className="meta-value">{user?.name || '—'}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">✉ EMAIL</div>
            <div className="meta-value">{user?.email || '—'}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">⊡ JOINED</div>
            <div className="meta-value">{joined}</div>
          </div>
        </div>
      </div>

      {/* JWT token */}
      <div className="settings-card">
        <div className="meta-label" style={{ marginBottom: 10 }}>🔐 JWT TOKEN</div>
        <div className="token-box">{tokenPreview}</div>
        <div className="token-note">Algorithm: HS256 · Expires in 1 hour · Payload: id, iat, exp</div>
      </div>

      {/* About */}
      <div className="settings-card">
        <div className="about-label">✦ ABOUT</div>
        <div className="about-title">Sprout Expense Tracker</div>
        <div className="about-desc">
          A calm, minimal personal-finance command center. Track income &amp; expenses,
          set monthly category budgets, visualize trends, and stay on top of your
          money — without the fintech-bro noise.
        </div>
        <div className="tech-row">
          <div>
            <div className="tech-label">FRONTEND</div>
            <div className="tech-value">React 18 · React Router · Recharts</div>
          </div>
          <div>
            <div className="tech-label">BACKEND</div>
            <div className="tech-value">Node.js · Express · MongoDB · JWT</div>
          </div>
        </div>
      </div>

      <button className="sign-out-btn" onClick={handleSignOut}>↗ Sign out</button>
    </div>
  );
}
