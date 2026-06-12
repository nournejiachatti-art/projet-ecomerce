import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  return (
    <div style={{
      width: '280px',
      background: 'linear-gradient(180deg, #1a6b6b 0%, #0d4f4f 100%)',
      color: 'white',
      minHeight: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 9999,
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontFamily: 'Playfair Display', margin: 0, fontSize: '1.5rem' }}>ShopEase</h3>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0.5rem 0 0' }}>Espace Administration</p>
      </div>
      
      <nav style={{ padding: '1.5rem 0', flex: 1, overflowY: 'auto' }}>
        <NavLink 
          to="/dashboard" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: 'white',
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            transition: 'all 0.3s ease',
            borderLeft: isActive ? '3px solid white' : '3px solid transparent'
          })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
          </svg>
          Tableau de bord
        </NavLink>
        
        <NavLink 
          to="/admin/orders" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: 'white',
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderLeft: isActive ? '3px solid white' : '3px solid transparent'
          })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="2" y1="8" x2="22" y2="8"/>
          </svg>
          Commandes
        </NavLink>
        
        <NavLink 
          to="/manage-users" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: 'white',
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderLeft: isActive ? '3px solid white' : '3px solid transparent'
          })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Utilisateurs
        </NavLink>
        
        <NavLink 
          to="/manage-categories" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: 'white',
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderLeft: isActive ? '3px solid white' : '3px solid transparent'
          })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          Catégories
        </NavLink>
        
        <NavLink 
          to="/manage-products" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: 'white',
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderLeft: isActive ? '3px solid white' : '3px solid transparent'
          })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="2" y1="8" x2="22" y2="8"/>
          </svg>
          Produits
        </NavLink>
        
        <NavLink 
          to="/manage-suppliers" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: 'white',
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderLeft: isActive ? '3px solid white' : '3px solid transparent'
          })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 8h16M4 16h16M8 4v4M16 4v4M4 4h16v16H4z"/>
          </svg>
          Fournisseurs
        </NavLink>
        
        <NavLink 
          to="/supplier-invoice" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            color: 'white',
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderLeft: isActive ? '3px solid white' : '3px solid transparent'
          })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="2" y1="8" x2="22" y2="8"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
          Factures
        </NavLink>
      </nav>
      
      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
        <button 
          onClick={handleLogout}
          style={{
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
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;