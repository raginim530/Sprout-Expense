import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-top">
            <div className="brand-icon">S</div>
            <div className="brand-name">Sprout</div>
          </div>
          <div className="brand-sub">Personal Finance</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({isActive})=>isActive?'nav-item active':'nav-item'}>
            <span className="nav-icon">⊞</span> Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({isActive})=>isActive?'nav-item active':'nav-item'}>
            <span className="nav-icon">⇄</span> Transactions
          </NavLink>
          <NavLink to="/budgets" className={({isActive})=>isActive?'nav-item active':'nav-item'}>
            <span className="nav-icon">◎</span> Budgets
          </NavLink>
          <NavLink to="/settings" className={({isActive})=>isActive?'nav-item active':'nav-item'}>
            <span className="nav-icon">⚙</span> Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="signed-as">
            Signed in as<br />
            <span className="signed-email">{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>↗ Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
