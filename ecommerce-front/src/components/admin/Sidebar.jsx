import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: '#1a6b6b',
    color: 'white',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 99999,
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    border: '3px solid red'  // DEBUG: Make it visible
  };

  const headerStyle = {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0
  };

  const navStyle = {
    flex: 1,
    padding: '1.5rem 0',
    overflowY: 'auto',
    overflowX: 'hidden'
  };

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    color: 'white',
    textDecoration: 'none',
    backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderLeft: isActive ? '3px solid white' : '3px solid transparent',
    transition: 'all 0.3s ease',
    width: '100%',
    boxSizing: 'border-box'
  });

  const footerStyle = {
    padding: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    fontSize: '14px'
  };

  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={{ fontFamily: 'Playfair Display', margin: 0, fontSize: '1.5rem' }}>ShopEase SIDEBAR</h3>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0.5rem 0 0' }}>Admin Panel - VISIBLE TEST</p>
      </div>

      {/* Navigation */}
      <nav style={navStyle}>
        <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/admin/orders" style={({ isActive }) => linkStyle(isActive)}>
          📋 Orders
        </NavLink>
        <NavLink to="/manage-users" style={({ isActive }) => linkStyle(isActive)}>
          👥 Users
        </NavLink>
        <NavLink to="/manage-categories" style={({ isActive }) => linkStyle(isActive)}>
          📂 Categories
        </NavLink>
        <NavLink to="/manage-products" style={({ isActive }) => linkStyle(isActive)}>
          📦 Products
        </NavLink>
        <NavLink to="/manage-suppliers" style={({ isActive }) => linkStyle(isActive)}>
          🤝 Suppliers
        </NavLink>
        <NavLink to="/supplier-invoice" style={({ isActive }) => linkStyle(isActive)}>
          📄 Invoices
        </NavLink>
      </nav>

      {/* Footer */}
      <div style={footerStyle}>
        <button 
          onClick={handleLogout}
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;